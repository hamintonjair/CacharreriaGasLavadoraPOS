const fs = require('fs');
const content = fs.readFileSync('server/routes/api.js', 'utf8');

const target = `    // URL local del logo\n    const logoUrl = \`/uploads/logos/\${req.file.filename}\`;\n\n    console.log("✅ Logo subido localmente:", logoUrl);\n\n    // Obtener o crear la empresa\n    let existingCompany = await prisma.company.findFirst();\n\n    if (existingCompany) {\n      // Eliminar el logo antiguo del disco si existe\n      if (existingCompany.logo_url && existingCompany.logo_url.startsWith('/uploads/')) {\n        const oldPath = path.join(process.cwd(), 'public', existingCompany.logo_url);\n        if (fs.existsSync(oldPath)) {\n          fs.unlinkSync(oldPath);\n        }\n      }\n    }`;

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
