-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "UserID" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "url" TEXT NOT NULL,

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Image" ADD CONSTRAINT "Image_UserID_fkey" FOREIGN KEY ("UserID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
