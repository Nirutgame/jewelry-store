export function formatPrice(price: number): string {
  return new Intl.NumberFormat("th-TH", {
    style: "currency",
    currency: "THB",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function getImageUrl(images: string): string {
  try {
    const imageArray = JSON.parse(images);
    return imageArray[0] || "/placeholder.jpg";
  } catch {
    return "/placeholder.jpg";
  }
}

export function getAllImages(images: string): string[] {
  try {
    return JSON.parse(images);
  } catch {
    return [];
  }
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}
