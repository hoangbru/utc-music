import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Music Streaming API",
      version: "1.0.0",
      description:
        "A production-ready RESTful API for a music streaming service",
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Development server",
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
  apis: ["./src/api/**/*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
export default swaggerSpec;