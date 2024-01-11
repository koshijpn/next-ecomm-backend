# NEXT ECOMM Backend

Welcome to the NEXT ECOMM Backend repository! This project is a vital component of the NEXT ECOMM system, complementing the frontend to create a comprehensive photo selling site.

## Technologies Used

- **Node.js:** Core backend technology
- **Prisma:** Database ORM
- **Docker:** Containerization for deployment
- **Payment Integration:** Stripe (API calls)
- **Image Storage:** AWS S3 (API operations for reading and writing)

## Project Structure

- **src/:** Contains the source code for the Node.js backend.
- **docker/:** Configuration files for Docker.

## Getting Started

To set up and run the NEXT ECOMM Backend locally, follow these steps:

1. **Ensure you have Node.js, Docker, and Prisma installed.**
2. **Clone this repository:** `git clone [repository-url]`
3. **Navigate to the project folder:** `cd next-ecomm-backend`
4. **Install dependencies:** `npm install`
5. **Set up the database with Prisma:** `npx prisma migrate dev`
6. **Run the Docker containers:** `docker-compose up`

## API Integration

- The backend integrates with the frontend through API calls, allowing seamless communication.
- Payment processing is handled through the Stripe platform.

## Image Storage

- Images are stored on AWS S3, and the backend facilitates read and write operations through the API.

## Deploying the Backend

- To deploy the backend, consider installing an [adapter](https://kit.svelte.dev/docs/adapters) suitable for your target environment.
