-- CreateTable
CREATE TABLE "Utilisateur" (
    "id" VARCHAR(191) NOT NULL,
    "email" VARCHAR(191) NOT NULL,
    "poids" DOUBLE PRECISION,
    "metabolismeCible" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "activite" VARCHAR(191),
    "age" INTEGER,
    "nom" VARCHAR(191),
    "photoUrl" VARCHAR(191),
    "sexe" VARCHAR(191),
    "taille" INTEGER,
    "objectifPoids" VARCHAR(191),
    "emailVerified" TIMESTAMP(3),
    "image" VARCHAR(191),
    "name" VARCHAR(191),
    "password" VARCHAR(191),
    "role" VARCHAR(191) NOT NULL DEFAULT 'user',
    "stripeCurrentPeriodEnd" TIMESTAMP(3),
    "stripeCustomerId" VARCHAR(191),
    "stripePriceId" VARCHAR(191),
    "stripeStatus" VARCHAR(191),
    "stripeSubscriptionId" VARCHAR(191),
    "birthdate" TIMESTAMP(3),
    "gender" VARCHAR(191),
    "phone" VARCHAR(191),
    "isSubscribed" BOOLEAN NOT NULL DEFAULT false,
    "trialEndsAt" TIMESTAMP(3),
    "hasAccessToFullContent" BOOLEAN NOT NULL DEFAULT false,
    "subscriptionEnd" TIMESTAMP(3),
    "subscriptionType" VARCHAR(191),
    "cancelAtPeriodEnd" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Utilisateur_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" VARCHAR(191) NOT NULL,
    "token" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmailVerificationToken" (
    "id" VARCHAR(191) NOT NULL,
    "token" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmailVerificationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HistoriquePoids" (
    "id" VARCHAR(191) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "poids" DOUBLE PRECISION NOT NULL,
    "utilisateurId" VARCHAR(191) NOT NULL,

    CONSTRAINT "HistoriquePoids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mensurations" (
    "id" VARCHAR(191) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "taille" INTEGER,
    "hanches" INTEGER,
    "cuisses" INTEGER,
    "bras" INTEGER,
    "tailleAbdo" INTEGER,
    "poitrine" INTEGER,
    "mollets" INTEGER,
    "masseGrasse" DOUBLE PRECISION,
    "utilisateurId" VARCHAR(191) NOT NULL,

    CONSTRAINT "Mensurations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Favori" (
    "id" VARCHAR(191) NOT NULL,
    "recetteId" VARCHAR(191) NOT NULL,
    "utilisateurId" VARCHAR(191) NOT NULL,

    CONSTRAINT "Favori_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "type" VARCHAR(191) NOT NULL,
    "provider" VARCHAR(191) NOT NULL,
    "providerAccountId" VARCHAR(191) NOT NULL,
    "refresh_token" VARCHAR(191),
    "access_token" VARCHAR(191),
    "expires_at" INTEGER,
    "token_type" VARCHAR(191),
    "scope" VARCHAR(191),
    "id_token" VARCHAR(191),
    "session_state" VARCHAR(191),

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" VARCHAR(191) NOT NULL,
    "sessionToken" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VerificationToken" (
    "identifier" VARCHAR(191) NOT NULL,
    "token" VARCHAR(191) NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "Recette" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "description" VARCHAR(191),
    "price" DOUBLE PRECISION,
    "timeCook" INTEGER,
    "timePrep" INTEGER,
    "cookingTime" INTEGER NOT NULL,
    "photoUrl" VARCHAR(191),
    "preparationTime" INTEGER NOT NULL,
    "steps" JSON NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    "calories" DOUBLE PRECISION,
    "carbs" INTEGER,
    "fat" INTEGER,
    "protein" DOUBLE PRECISION,
    "scalable" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Recette_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ingredient" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "calories" INTEGER NOT NULL,
    "carbs" INTEGER NOT NULL,
    "fat" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "protein" INTEGER NOT NULL,
    "ingredientType" VARCHAR(191),
    "unit" VARCHAR(191) NOT NULL DEFAULT 'g',

    CONSTRAINT "Ingredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecetteIngredient" (
    "id" VARCHAR(191) NOT NULL,
    "recetteId" VARCHAR(191) NOT NULL,
    "ingredientId" VARCHAR(191) NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "unit" VARCHAR(191) NOT NULL,

    CONSTRAINT "RecetteIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" VARCHAR(191) NOT NULL,
    "name" VARCHAR(191) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecetteCategory" (
    "id" VARCHAR(191) NOT NULL,
    "recetteId" VARCHAR(191) NOT NULL,
    "categoryId" VARCHAR(191) NOT NULL,

    CONSTRAINT "RecetteCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepasJournalier" (
    "id" VARCHAR(191) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "repasType" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "recetteId" VARCHAR(191),
    "customName" VARCHAR(191),
    "calories" INTEGER,
    "protein" DOUBLE PRECISION,
    "fat" INTEGER,
    "carbs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "RepasJournalier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MenuJournalier" (
    "id" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "repasType" VARCHAR(191) NOT NULL,
    "recetteId" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    CONSTRAINT "MenuJournalier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecetteAllowedSide" (
    "recetteId" VARCHAR(191) NOT NULL,
    "sideType" TEXT NOT NULL,

    CONSTRAINT "RecetteAllowedSide_pkey" PRIMARY KEY ("recetteId","sideType")
);

-- CreateTable
CREATE TABLE "IngredientSideType" (
    "ingredientId" VARCHAR(191) NOT NULL,
    "sideType" TEXT NOT NULL,

    CONSTRAINT "IngredientSideType_pkey" PRIMARY KEY ("ingredientId","sideType")
);

-- CreateTable
CREATE TABLE "Accompagnement" (
    "id" VARCHAR(191) NOT NULL,
    "menuId" VARCHAR(191) NOT NULL,
    "ingredientId" VARCHAR(191) NOT NULL,
    "quantity" INTEGER NOT NULL,

    CONSTRAINT "Accompagnement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Post" (
    "id" VARCHAR(191) NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" VARCHAR(191),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" VARCHAR(191) NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" VARCHAR(191) NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "authorId" VARCHAR(191) NOT NULL,
    "postId" VARCHAR(191) NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" VARCHAR(191) NOT NULL,
    "userId" VARCHAR(191) NOT NULL,
    "postId" VARCHAR(191) NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Temoignage" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "validated" BOOLEAN NOT NULL DEFAULT false,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Temoignage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_email_key" ON "Utilisateur"("email");

-- CreateIndex
CREATE UNIQUE INDEX "utilisateur_stripecustomerid_key" ON "Utilisateur"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "passwordresettoken_token_key" ON "PasswordResetToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "emailverificationtoken_token_key" ON "EmailVerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "account_provider_provideraccountid_key" ON "Account"("provider", "providerAccountId");

-- CreateIndex
CREATE UNIQUE INDEX "session_sessiontoken_key" ON "Session"("sessionToken");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtoken_token_key" ON "VerificationToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verificationtoken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- CreateIndex
CREATE UNIQUE INDEX "recetteingredient_recetteid_ingredientid_key" ON "RecetteIngredient"("recetteId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "recettecategory_recetteid_categoryid_key" ON "RecetteCategory"("recetteId", "categoryId");

-- CreateIndex
CREATE UNIQUE INDEX "accompagnement_menuid_ingredientid_key" ON "Accompagnement"("menuId", "ingredientId");

-- CreateIndex
CREATE UNIQUE INDEX "Like_userId_postId_key" ON "Like"("userId", "postId");

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmailVerificationToken" ADD CONSTRAINT "EmailVerificationToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HistoriquePoids" ADD CONSTRAINT "HistoriquePoids_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mensurations" ADD CONSTRAINT "Mensurations_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_recetteId_fkey" FOREIGN KEY ("recetteId") REFERENCES "Recette"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favori" ADD CONSTRAINT "Favori_utilisateurId_fkey" FOREIGN KEY ("utilisateurId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetteIngredient" ADD CONSTRAINT "RecetteIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetteIngredient" ADD CONSTRAINT "RecetteIngredient_recetteId_fkey" FOREIGN KEY ("recetteId") REFERENCES "Recette"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetteCategory" ADD CONSTRAINT "RecetteCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetteCategory" ADD CONSTRAINT "RecetteCategory_recetteId_fkey" FOREIGN KEY ("recetteId") REFERENCES "Recette"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepasJournalier" ADD CONSTRAINT "RepasJournalier_recetteId_fkey" FOREIGN KEY ("recetteId") REFERENCES "Recette"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RepasJournalier" ADD CONSTRAINT "RepasJournalier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuJournalier" ADD CONSTRAINT "MenuJournalier_recetteId_fkey" FOREIGN KEY ("recetteId") REFERENCES "Recette"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MenuJournalier" ADD CONSTRAINT "MenuJournalier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecetteAllowedSide" ADD CONSTRAINT "RecetteAllowedSide_recetteId_fkey" FOREIGN KEY ("recetteId") REFERENCES "Recette"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IngredientSideType" ADD CONSTRAINT "IngredientSideType_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accompagnement" ADD CONSTRAINT "Accompagnement_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accompagnement" ADD CONSTRAINT "Accompagnement_menuId_fkey" FOREIGN KEY ("menuId") REFERENCES "MenuJournalier"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Temoignage" ADD CONSTRAINT "Temoignage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Utilisateur"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

