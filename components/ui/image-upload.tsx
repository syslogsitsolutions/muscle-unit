"use client";

import { useEffect, useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Trash } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: () => void;
  value: string;
}

export function ImageUpload({
  disabled,
  onChange,
  onRemove,
  value,
}: ImageUploadProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  //   return (
  //     <div>
  //       {/* Preview if image is uploaded */}
  //       {value && (
  //         <div className="relative w-[200px] h-[200px] mb-4 rounded-md overflow-hidden border">
  //           <Image
  //             fill
  //             className="object-cover"
  //             alt="Uploaded preview"
  //             src={value}
  //           />
  //           <div className="absolute top-2 right-2 z-10">
  //             <Button
  //               type="button"
  //               onClick={onRemove}
  //               variant="destructive"
  //               size="icon"
  //             >
  //               <Trash className="w-4 h-4" />
  //             </Button>
  //           </div>
  //         </div>
  //       )}

  //       {/* Upload button */}
  //       <CldUploadWidget
  //         uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
  //         onSuccess={(result: any) => {
  //           console.log("result", result);

  //           if (result?.info?.secure_url) {
  //             onChange(result.info.secure_url);
  //           }
  //         }}
  //         options={{
  //           maxFiles: 1,
  //           sources: ["local", "camera", "url"],
  //           resourceType: "image",
  //           clientAllowedFormats: ["jpg", "png", "webp"],
  //           maxFileSize: 1048576, // 1MB
  //         }}
  //       >
  //         {({ open }) => (
  //           <Button
  //             type="button"
  //             onClick={() => open()}
  //             disabled={disabled}
  //             variant="secondary"
  //           >
  //             <ImagePlus className="h-4 w-4 mr-2" />
  //             {value ? "Change Image" : "Upload Image"}
  //           </Button>
  //         )}
  //       </CldUploadWidget>
  //     </div>
  //   );
  return (
    <div className="flex flex-col items-start gap-2">
      <CldUploadWidget
        uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
        onSuccess={(result: any) => {
          if (result?.info?.secure_url) {
            onChange(result.info.secure_url);
          }
        }}
        options={{
          maxFiles: 1,
          sources: ["local", "camera"],
          resourceType: "image",
          clientAllowedFormats: ["jpg", "png", "webp"],
          maxFileSize: 1048576,
        }}
      >
        {({ open }) => (
          <div
            className="w-28 h-28 rounded-md border-2 border-dashed flex items-center justify-center bg-muted/40 hover:bg-muted/30 transition group relative cursor-pointer"
            onClick={() => !disabled && open()}
          >
            {value ? (
              <>
                <Image
                  fill
                  src={value}
                  alt="Uploaded image"
                  className="object-cover rounded-md"
                />
                <div className="absolute top-1 right-1 z-10">
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemove();
                    }}
                    variant="destructive"
                    size="icon"
                  >
                    <Trash className="h-3 w-3" />
                  </Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-muted-foreground gap-1">
                <ImagePlus className="w-4 h-4" />
                <p className="text-xs text-center">Click to upload</p>
              </div>
            )}
          </div>
        )}
      </CldUploadWidget>
    </div>
  );
}
