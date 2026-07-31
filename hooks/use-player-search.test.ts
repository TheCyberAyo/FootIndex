// @vitest-environment happy-dom

import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@/lib/search/session", () => ({
  recordSearchQuery: vi.fn(),
}));

import { usePlayerSearch } from "@/hooks/use-player-search";

describe("usePlayerSearch", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("does not fetch when query is shorter than 2 characters", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePlayerSearch({ debounceMs: 200 }));

    act(() => {
      result.current.setQuery("h");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(250);
    });

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it("debounces fetch requests", async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ results: [] }),
    });
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePlayerSearch({ debounceMs: 200 }));

    act(() => {
      result.current.setQuery("ha");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(100);
    });
    expect(fetchMock).not.toHaveBeenCalled();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(120);
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(fetchMock.mock.calls[0]?.[0]).toContain("/api/search?q=ha");
  });

  it("aborts in-flight request when query changes quickly", async () => {
    let firstSignal: AbortSignal | null | undefined;

    const fetchMock = vi
      .fn()
      .mockImplementationOnce((_url: string, init?: RequestInit) => {
        firstSignal = init?.signal;
        return new Promise(() => {
          // Never resolve — simulates a slow in-flight request.
        });
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          results: [{ id: "2", slug: "mbappe", name: "Mbappé" }],
        }),
      });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => usePlayerSearch({ debounceMs: 50 }));

    act(() => {
      result.current.setQuery("haa");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60);
    });

    act(() => {
      result.current.setQuery("mbap");
    });

    await act(async () => {
      await vi.advanceTimersByTimeAsync(60);
    });

    expect(firstSignal?.aborted).toBe(true);
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(result.current.results[0]?.slug).toBe("mbappe");
  });
});
