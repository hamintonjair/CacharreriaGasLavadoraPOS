const fs = require('fs');
const content = fs.readFileSync('server/routes/api.js', 'utf8');

const target = `    // URL local del logo
    const logoUrl = \`/uploads/logos/\${req.file.filename}\`;

    console.log("✅ Logo subido localmente:", logoUrl);

    // Obtener o crear la empresa
    let existingCompany = await prisma.company.findFirst();

    if (existingCompany) {
      // Eliminar el logo antiguo del disco si existe
      if (existingCompany.logo_url && existingCompany.logo_url.startsWith('/uploads/')) {
        const oldLogoPath = path.join(process.cwd(), 'public', existingCompany.logo_url);
        try {
          if (fs.existsSync(oldLogoPath)) {
            fs.unlinkSync(oldLogoPath);
            console.log("🗑️ Logo antiguo eliminado:", oldLogoPath);
          }
        } catch (err) {
          console.error("Error eliminando logo antiguo:", err);
        }
      }
    }`;

const replacement = `    // Subir a Supabase Storage
    const fileBuffer = fs.readFileSync(req.file.path);
    
    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('uploads')
      .upload(\`logos/\${req.file.filename}\`, fileBuffer, {
        contentType: req.file.mimetype,
        upsert: true
      });

    if (uploadError) {
      console.error("Error subiendo a Supabase:", uploadError);
      return res.status(500).json({ error: "No se pudo subir el logo a la nube" });
    }

    // Obtener URL publica de Supabase
    const { data: { publicUrl } } = supabase
      .storage
      .from('uploads')
      .getPublicUrl(\`logos/\${req.file.filename}\`);

    const logoUrl = publicUrl;
    console.log("✅ Logo subido a Supabase Storage:", logoUrl);

    // Borrar el archivo temporal local de Render
    try { fs.unlinkSync(req.file.path); } catch(e) {}

    let existingCompany = await prisma.company.findFirst();`;

fs.writeFileSync('server/routes/api.js', content.replace(target, replacement));
