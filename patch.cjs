const fs = require('fs');

const filePath = 'C:\\Users\\isido\\.gemini\\antigravity\\scratch\\technova_site\\src\\routes\\admin\\products\\.tsx';
let content = fs.readFileSync(filePath, 'utf8');

const oldUi = fs.readFileSync('old_ui.txt', 'utf8');
const newUi = fs.readFileSync('new_ui.txt', 'utf8');

if (!content.includes(oldUi.trim().substring(0, 50))) {
    console.error('Could not find old UI block');
    process.exit(1);
}

// Ensure the UI gets replaced cleanly without template literal execution errors
content = content.replace(oldUi, newUi);

// Also apply the other state and logic changes
content = content.replace(
    '  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);\n  const [downloadFile, setDownloadFile] = useState<File | null>(null);',
    '  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);\n  const [downloadFiles, setDownloadFiles] = useState<File[]>([]);'
);

content = content.replace(
    '      setDownloadUrl(featuresData.file_url || null);',
    '      const fileUrls = featuresData.file_urls || (featuresData.file_url ? [featuresData.file_url] : []);\n      setDownloadUrls(fileUrls);'
);

content = content.replace(
    '      let newDownload = downloadUrl;\n      let newSeoImg = seoImageUrl;\n\n      if (thumbnailFile) newThumb = await uploadFile(thumbnailFile, \'thumbnails\');\n      if (downloadFile) newDownload = await uploadFile(downloadFile, \'downloads\');\n      if (seoImageFile) newSeoImg = await uploadFile(seoImageFile, \'seo-images\');',
    '      let finalDownloadUrls = [...downloadUrls];\n      let newSeoImg = seoImageUrl;\n\n      if (thumbnailFile) newThumb = await uploadFile(thumbnailFile, \'thumbnails\');\n      \n      for (const f of downloadFiles) {\n        const url = await uploadFile(f, \'downloads\');\n        if (url) finalDownloadUrls.push(url);\n      }\n      \n      if (seoImageFile) newSeoImg = await uploadFile(seoImageFile, \'seo-images\');'
);

content = content.replace(
    '        file_url: newDownload,',
    '        file_urls: finalDownloadUrls,'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully patched!');
