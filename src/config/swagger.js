import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "UTC Music Streaming API",
      version: "1.0.0",
      description:
        "A production-ready RESTful API for a music streaming service",
    },
    servers: [
      {
        url:
          process.env.NODE_ENV === "production"
            ? process.env.API_URL
            : "http://localhost:3000",
        description:
          process.env.NODE_ENV === "production"
            ? "Production server"
            : "Development server",
      },
    ],

    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./src/api/**/*.js", "./dist/api/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
export default swaggerSpec;
