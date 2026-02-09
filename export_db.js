const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Configuración de la base de datos
const config = {
  connectionString: "postgresql://cacharreria_user:DryTX8X36DBvwtokwpw10SH9FxjtAH8W@dpg-d4ithnf5r7bs73dn8840-a.oregon-postgres.render.com/cacharreria_gas_db"
};

async function exportDatabase() {
  const client = new Client(config);
  
  try {
    console.log('Conectando a la base de datos...');
    await client.connect();
    
    console.log('Obteniendo lista de tablas...');
    const tablesQuery = `
      SELECT tablename 
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY tablename;
    `;
    const tablesResult = await client.query(tablesQuery);
    const tables = tablesResult.rows.map(row => row.tablename);
    
    console.log(`Encontradas ${tables.length} tablas`);
    
    let exportSQL = '-- Exportación de la base de datos cacharreria_gas_db\n';
    exportSQL += '-- Fecha: ' + new Date().toISOString() + '\n\n';
    
    // Para cada tabla, exportar estructura y datos
    for (const table of tables) {
      console.log(`Exportando tabla: ${table}`);
      
      // Obtener estructura de la tabla
      const structureQuery = `
        SELECT 
          'CREATE TABLE ' || $1 || ' (' || 
          array_to_string(
            array_agg(
              column_name || ' ' || 
              data_type || 
              CASE 
                WHEN character_maximum_length IS NOT NULL THEN '(' || character_maximum_length || ')'
                WHEN numeric_precision IS NOT NULL AND numeric_scale IS NOT NULL THEN '(' || numeric_precision || ',' || numeric_scale || ')'
                WHEN numeric_precision IS NOT NULL THEN '(' || numeric_precision || ')'
                ELSE ''
              END ||
              CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END
            ),
            ', '
          ) || ');' as create_statement
        FROM information_schema.columns 
        WHERE table_name = $1 
        AND table_schema = 'public'
        GROUP BY table_name;
      `;
      
      const structureResult = await client.query(structureQuery, [table]);
      
      if (structureResult.rows.length > 0) {
        exportSQL += `-- Estructura de la tabla ${table}\n`;
        exportSQL += structureResult.rows[0].create_statement + '\n\n';
        
        // Obtener datos de la tabla
        const dataQuery = `SELECT * FROM public."${table}"`;
        const dataResult = await client.query(dataQuery);
        
        if (dataResult.rows.length > 0) {
          exportSQL += `-- Datos de la tabla ${table} (${dataResult.rows.length} registros)\n`;
          
          for (const row of dataResult.rows) {
            const columns = Object.keys(row);
            const values = columns.map(col => {
              const value = row[col];
              if (value === null) return 'NULL';
              if (typeof value === 'string') return `'${value.replace(/'/g, "''")}'`;
              if (value instanceof Date) return `'${value.toISOString()}'`;
              return value;
            });
            
            exportSQL += `INSERT INTO public."${table}" (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${values.join(', ')});\n`;
          }
          exportSQL += '\n';
        } else {
          exportSQL += `-- La tabla ${table} no tiene datos\n\n`;
        }
      }
    }
    
    // Guardar el archivo
    const outputPath = path.join(__dirname, 'cacharreria_db_export.sql');
    fs.writeFileSync(outputPath, exportSQL);
    
    console.log(`¡Exportación completada! Archivo guardado en: ${outputPath}`);
    console.log(`Tamaño del archivo: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
    
  } catch (error) {
    console.error('Error durante la exportación:', error);
  } finally {
    await client.end();
  }
}

exportDatabase();
