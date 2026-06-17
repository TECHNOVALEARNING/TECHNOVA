$files = @("src\pages\dashboard\CreateProduct.tsx", "src\pages\dashboard\EditProduct.tsx")

foreach ($file in $files) {
    $content = Get-Content $file -Raw -Encoding UTF8

    # Replace download-input
    $searchDownload = '(?ms)id="download-input"\s*type="file"\s*className="hidden"\s*onChange=\{\(e\) => setDownloadFile\(e\.target\.files\?\.\[0\] \|\| null\)\}'
    $replaceDownload = 'id="download-input"
                      type="file"
                      className="hidden"
                      accept={fileFormat === "image" ? "image/*" : fileFormat === "audio" ? "audio/*" : fileFormat === "software" ? ".exe,.dmg,.pkg,.zip,.rar" : ".pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"}
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) {
                          if (f.size > 50 * 1024 * 1024) {
                            toast.error("Le fichier dépasse la limite autorisée de 50MB.");
                            e.target.value = "";
                            setDownloadFile(null);
                            return;
                          }
                          setDownloadFile(f);
                        } else {
                          setDownloadFile(null);
                        }
                      }}'
    $content = [regex]::Replace($content, $searchDownload, $replaceDownload)

    # Replace thumbnail-input
    $searchThumbnail = '(?ms)id="thumbnail-input"\s*type="file"\s*accept="image/\*"\s*className="hidden"\s*onChange=\{\(e\) => \{\s*const f = e\.target\.files\?\.\[0\];\s*if \(f\) \{\s*setThumbnailFile\(f\);\s*handleFilePreview\(f, setThumbnailPreview\);\s*\}\s*\}\}'
    $replaceThumbnail = 'id="thumbnail-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              if (f.size > 50 * 1024 * 1024) {
                                toast.error("La vignette dépasse la limite de 50MB.");
                                e.target.value = "";
                                return;
                              }
                              setThumbnailFile(f);
                              handleFilePreview(f, setThumbnailPreview);
                            }
                          }}'
    $content = [regex]::Replace($content, $searchThumbnail, $replaceThumbnail)

    # Replace banner-input
    $searchBanner = '(?ms)id="banner-input"\s*type="file"\s*accept="image/\*"\s*className="hidden"\s*onChange=\{\(e\) => \{\s*const f = e\.target\.files\?\.\[0\];\s*if \(f\) \{\s*setBannerFile\(f\);\s*handleFilePreview\(f, setBannerPreview\);\s*\}\s*\}\}'
    $replaceBanner = 'id="banner-input"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) {
                              if (f.size > 50 * 1024 * 1024) {
                                toast.error("La bannière dépasse la limite de 50MB.");
                                e.target.value = "";
                                return;
                              }
                              setBannerFile(f);
                              handleFilePreview(f, setBannerPreview);
                            }
                          }}'
    $content = [regex]::Replace($content, $searchBanner, $replaceBanner)

    Set-Content -Path $file -Value $content -Encoding UTF8
}
