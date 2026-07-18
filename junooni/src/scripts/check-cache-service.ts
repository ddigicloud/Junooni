export default async function testCache({ container }: { container: any }) {
  const cache = container.resolve("cache")
  
  console.log("\n🧪 TESTING cache.set and cache.get:")
  try {
    await cache.set("test-vendor-products", { products: [{ id: "test" }] }, 300)
    console.log("✓ cache.set worked")
    
    const result = await cache.get("test-vendor-products")
    console.log("✓ cache.get result:", result)
    
    await cache.invalidate("test-vendor-products")
    console.log("✓ cache.invalidate worked")
    
    const afterInvalidate = await cache.get("test-vendor-products")
    console.log("✓ after invalidate:", afterInvalidate) // should be null
  } catch (e: any) {
    console.log("✗ Cache error:", e.message)
  }
  
  console.log("\n✅ Done\n")
}