import { Badge } from "./ui/badge";
import {
  Book,
  FileText,
  Palette,
  Shirt,
  Pencil,
  Laptop,
  Sparkles,
  MoreHorizontal
} from "lucide-react";

export function CategoryFilter({ selectedCategory, onSelectCategory }) {
  const categories = [
    { id: "all", label: "All", icon: Sparkles },
    { id: "books", label: "Books", icon: Book },
    { id: "notes", label: "Study Notes", icon: FileText },
    { id: "handcrafts", label: "Handcrafts", icon: Palette },
    { id: "art", label: "Art & Design", icon: Palette },
    { id: "apparel", label: "Apparel", icon: Shirt },
    { id: "stationery", label: "Stationery", icon: Pencil },
    { id: "electronics", label: "Electronics", icon: Laptop },
    { id: "other", label: "Other", icon: MoreHorizontal }
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {categories.map((category) => {
        const Icon = category.icon;
        const isActive = selectedCategory === category.id;

        return (
          <Badge
            key={category.id}
            variant={isActive ? "default" : "outline"}
            className={`cursor-pointer px-4 py-2 gap-2 rounded-full transition-all ${
              isActive
                ? "bg-primary hover:bg-primary/90"
                : "hover:bg-muted"
            }`}
            onClick={() => onSelectCategory(category.id)}
          >
            <Icon className="h-3.5 w-3.5" />
            {category.label}
          </Badge>
        );
      })}
    </div>
  );
}
