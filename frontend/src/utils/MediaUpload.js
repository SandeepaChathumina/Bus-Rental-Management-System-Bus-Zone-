import { createClient } from "@supabase/supabase-js";
import toast from "react-hot-toast";

const supabase = createClient(
  "https://ombvnpeoietugpxelugs.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tYnZucGVvaWV0dWdweGVsdWdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE5ODM2ODYsImV4cCI6MjA2NzU1OTY4Nn0.mv9NsqrC2tckMmHa2w0X8Vg0fGtjsQXYYbMG1LRy9K4"
);

export default function MediaUpload(file) {
  const promise = new Promise((resolve, reject) => {
    if (file == null) {
      reject("No file selected");
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      reject("File size must be less than 5MB");
      return;
    }

    const timeStamp = new Date().getTime();
    const newFileName = `${timeStamp}-${file.name}`;

    supabase.storage
      .from('cropcartimages')
      .upload(`BusZone/${newFileName}`, file, {
        cacheControl: '3600',
        upsert: false
      })
      .then(() => {
        const url = supabase.storage
          .from('cropcartimages')
          .getPublicUrl(`BusZone/${newFileName}`)
          .data.publicUrl;
        resolve(url);
      })
      .catch((error) => {
        console.error("Error uploading image:", error);
        toast.error("Error uploading image");
        reject("Error uploading image");
      });
  });

  return promise;
}
