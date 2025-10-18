# Music Streaming API

A production-ready RESTful API for a music streaming service, built with Node.js, Express.js, PostgreSQL, and Prisma.

## Features

- **Authentication**: JWT-based authentication with email verification
- **User Management**: User profiles, playlists, and liked songs
- **Music Catalog**: Songs, artists, albums, and genres
- **Playlist Management**: Create, update, delete, and reorder playlists
- **Search**: Full-text search for songs, artists, and albums
- **Admin Panel**: Complete CRUD operations for all entities
- **API Documentation**: Swagger/OpenAPI documentation at `/api-docs`
- **Error Handling**: Global error handling middleware
- **Security**: Password hashing with bcrypt, JWT tokens, role-based access control

## Technology Stack

- **Backend**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: JWT (jsonwebtoken)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **API Documentation**: Swagger (swagger-jsdoc, swagger-ui-express)
- **File Storage**: Cloudinary (stub implementation)

## Installation

### Prerequisites

- Node.js v18+
- PostgreSQL database
- npm or yarn

### Setup

1. **Clone the repository**
   \`\`\`bash
   git clone <repository-url>
   cd music-streaming-api
   \`\`\`

2. **Install dependencies**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configure environment variables**
   \`\`\`bash
   cp .env.example .env
   \`\`\`
   Edit `.env` and update the following:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `JWT_SECRET`: A strong secret key for JWT tokens
   - `JWT_REFRESH_SECRET`: A strong secret key for refresh tokens
   - `PORT`: Server port (default: 3000)

4. **Setup the database**
   \`\`\`bash
   npx prisma migrate dev --name init
   \`\`\`
   This will create all tables and run migrations.

5. **Start the server**
   \`\`\`bash
   npm run dev
   \`\`\`
   The server will start on `http://localhost:3000`

6. **Access API Documentation**
   Open your browser and navigate to `http://localhost:3000/api-docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh-token` - Refresh access token

### User (Protected)
- `GET /api/me` - Get current user profile
- `PUT /api/me` - Update user profile
- `GET /api/me/playlists` - Get user's playlists
- `GET /api/me/liked-songs` - Get user's liked songs

### Songs (Public)
- `GET /api/songs/:id` - Get song details
- `POST /api/songs/:id/play` - Record song play (Protected)
- `POST /api/songs/:id/like` - Like a song (Protected)
- `DELETE /api/songs/:id/unlike` - Unlike a song (Protected)

### Playlists (Protected)
- `POST /api/playlists` - Create playlist
- `GET /api/playlists/:id` - Get playlist details
- `PUT /api/playlists/:id` - Update playlist
- `DELETE /api/playlists/:id` - Delete playlist
- `POST /api/playlists/:id/add-song` - Add song to playlist
- `DELETE /api/playlists/:id/remove-song` - Remove song from playlist
- `PUT /api/playlists/:id/reorder` - Reorder songs in playlist

### Artists (Public)
- `GET /api/artists` - Get all artists
- `GET /api/artists/:id` - Get artist details
- `GET /api/artists/:id/songs` - Get artist's songs
- `GET /api/artists/:id/albums` - Get artist's albums

### Albums (Public)
- `GET /api/albums` - Get all albums
- `GET /api/albums/:id` - Get album details

### Genres (Public)
- `GET /api/genres` - Get all genres
- `GET /api/genres/:id/songs` - Get songs by genre

### Search (Public)
- `GET /api/search?q=query` - Search songs, artists, albums

### Admin (Protected - Admin Role Required)
- `POST /api/admin/songs` - Create song
- `GET /api/admin/songs` - Get all songs
- `PUT /api/admin/songs/:id` - Update song
- `DELETE /api/admin/songs/:id` - Delete song
- `POST /api/admin/artists` - Create artist
- `GET /api/admin/artists` - Get all artists
- `PUT /api/admin/artists/:id` - Update artist
- `DELETE /api/admin/artists/:id` - Delete artist
- `PUT /api/admin/artists/:id/verify` - Verify artist
- `POST /api/admin/albums` - Create album
- `GET /api/admin/albums` - Get all albums
- `PUT /api/admin/albums/:id` - Update album
- `DELETE /api/admin/albums/:id` - Delete album
- `POST /api/admin/genres` - Create genre
- `GET /api/admin/genres` - Get all genres
- `PUT /api/admin/genres/:id` - Update genre
- `DELETE /api/admin/genres/:id` - Delete genre
- `GET /api/admin/users` - Get all users
- `PUT /api/admin/users/:id/status` - Update user status

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. To access protected routes:

1. Register and verify your email
2. Login to get access and refresh tokens
3. Include the access token in the `Authorization` header:
   \`\`\`
   Authorization: Bearer <your-access-token>
   \`\`\`

## Database Schema

The database includes the following main entities:

- **User**: User accounts with roles (USER, ADMIN)
- **Playlist**: User playlists with songs
- **Song**: Music tracks with metadata
- **Artist**: Music artists
- **Album**: Music albums
- **Genre**: Music genres
- **EmailVerification**: Email verification codes

See `prisma/schema.prisma` for the complete schema.

## Error Handling

The API uses a global error handling middleware that returns consistent error responses:

\`\`\`json
{
  "error": "Error message"
}
\`\`\`

## Development

### Run in development mode with auto-reload
\`\`\`bash
npm run dev
\`\`\`

### Generate Prisma Client
\`\`\`bash
npm run prisma:generate
\`\`\`

### Open Prisma Studio (Database GUI)
\`\`\`bash
npm run prisma:studio
\`\`\`

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a production database (e.g., AWS RDS, Heroku Postgres)
3. Set strong JWT secrets
4. Configure CORS appropriately
5. Use a process manager like PM2
6. Set up proper logging and monitoring

## Future Enhancements

- [ ] OAuth integration (Google, Spotify)
- [ ] Real email service integration
- [ ] Cloudinary file upload implementation
- [ ] Rate limiting
- [ ] Caching with Redis
- [ ] WebSocket support for real-time updates
- [ ] Advanced search with Elasticsearch
- [ ] Analytics and recommendations
- [ ] Payment integration for premium features

## License

MIT

## Support

For issues or questions, please open an issue on the repository.
