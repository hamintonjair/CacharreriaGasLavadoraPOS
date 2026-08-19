const fs = require('fs');
const content = fs.readFileSync('server/routes/api.js', 'utf8');

const target = `    const overdueRentals = await prisma.rental.findMany({
      where: {
        status: "ACTIVE",
        dueDate: { lt: new Date() },
      },
      include: {
        client: true,
        items: {
          include: {
            product: true,
            gasType: true,
          },
        },
      },
      orderBy: { dueDate: "asc" },
    });

    const formatted = overdueRentals.map(r => ({
      ...r,
      urgency: "OVERDUE",
      diasAtraso: Math.floor(
        (new Date().getTime() - new Date(r.dueDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));`;

const replacement = `    const overdueRentals = await prisma.rental.findMany({
      where: {
        status: { in: ["RENTED", "OVERDUE"] },
        scheduledReturnDate: { lt: new Date() },
      },
      include: {
        client: true,
        washingMachine: true,
      },
      orderBy: { scheduledReturnDate: "asc" },
    });

    const formatted = overdueRentals.map(r => ({
      ...r,
      urgency: "OVERDUE",
      diasAtraso: Math.floor(
        (new Date().getTime() - new Date(r.scheduledReturnDate).getTime()) / (1000 * 60 * 60 * 24)
      ),
    }));`;

fs.writeFileSync('server/routes/api.js', content.replace(target, replacement));
