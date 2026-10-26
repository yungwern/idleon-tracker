// Gem/cash shop bundles received (BundlesReceived keys, e.g. 'ban_i')
export function isBundleOwned(bundles, name) {
  return (bundles?.owned ?? []).includes(name)
}
