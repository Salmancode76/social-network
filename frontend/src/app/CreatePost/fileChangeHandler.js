import imageCompression from "browser-image-compression";

export const fileChangeHandler =
  (setError, setErrorMessage, setFormData, ImageDiv, fileInputRef) =>
  async (e) => {
    ImageDiv.current.style.backgroundImage = "none";

    try {
      // Compression options
      const options = {
        maxSizeMB: 1,
        useWebWorker: true,
        quality: 1,
      };

      const file = e.target.files[0];
      if (file) {
        if (file.size > 5 * 1024 ** 2) {
          setError(true);
          setErrorMessage(
            "File size must be less than 5MB or wrong file type."
          );
          setFormData((prev) => ({ ...prev, image_file: "" }));
          if (fileInputRef.current) fileInputRef.current.value = "";

          return;
        }

        let processedFile;
        //Compress images only not gifs
        if (file.type === "image/gif") {
          processedFile = file;
        } else {
          processedFile = await imageCompression(file, options);
        }

        const reader = new FileReader();
        reader.onload = () => {
          setFormData((prev) => ({
            ...prev,
            image_file: reader.result,
          }));

          ImageDiv.current.style.backgroundImage = `url(${reader.result})`;
        };

        reader.readAsDataURL(processedFile);
      }
      setError(false);
    } catch (e) {
      setError(true);
      setErrorMessage(e.message);
      if (fileInputRef.current) fileInputRef.current.value = "";

    }
  };
