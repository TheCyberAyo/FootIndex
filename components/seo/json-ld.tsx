interface JsonLdProps {
  data: unknown;
}

/**
 * Server-only JSON-LD script tag. Keep structured data out of client bundles.
 */
export function JsonLd({ data }: JsonLdProps) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
