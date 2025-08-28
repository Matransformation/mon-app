import Image from "next/image";

export default function MealImage({ recette, repasType }) {
  if (!recette?.photoUrl) return null;
  return (
    <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl">
      <Image
        src={recette.photoUrl}
        alt={recette.name}
        fill
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 33vw"
        priority={repasType === "petit-dejeuner"}
      />
    </div>
  );
}
