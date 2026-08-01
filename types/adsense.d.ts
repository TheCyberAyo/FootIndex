interface AdsByGoogleEntry {
  requestNonPersonalizedAds?: 1;
}

interface Window {
  adsbygoogle?: AdsByGoogleEntry[];
}
