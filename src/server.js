import app from "./app.js"
import prisma from "./config/db.js"

const PORT = process.env.PORT || 3000

const startServer = async () => {
  try {
    // Test database connection
    await prisma.$connect()
    console.log("✓ Database connected successfully")

    app.listen(PORT, () => {
      console.log(`✓ Server running on http://localhost:${PORT}`)
      console.log(`✓ API Documentation: http://localhost:${PORT}/api-docs`)
    })
  } catch (error) {
    console.error("✗ Failed to start server:", error)
    process.exit(1)
  }
}

startServer()

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n✓ Shutting down gracefully...")
  await prisma.$disconnect()
  process.exit(0)
})
