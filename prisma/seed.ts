import { PrismaClient, UserRole, InvoiceStatus } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const organization = await prisma.organization.upsert({
    where: { slug: "greenfield-school" },
    update: {},
    create: {
      name: "Greenfield International School",
      slug: "greenfield-school",
      email: "admin@greenfield.test",
      phone: "+234 800 000 0000",
      address: "Demo Campus, Nigeria",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@greenfield.test" },
    update: {},
    create: {
      organizationId: organization.id,
      name: "Demo Admin",
      email: "admin@greenfield.test",
      role: UserRole.SCHOOL_ADMIN,
    },
  });

  const classRoom = await prisma.classRoom.create({
    data: { organizationId: organization.id, name: "SS2 Science", level: "Senior Secondary" },
  });

  const student = await prisma.student.create({
    data: {
      organizationId: organization.id,
      admissionNo: "STU-1001",
      firstName: "Amina",
      lastName: "Yusuf",
      gender: "Female",
      classRoomId: classRoom.id,
      guardianName: "Mr. Yusuf",
      guardianPhone: "+234 800 000 0001",
    },
  });

  await prisma.invoice.create({
    data: {
      organizationId: organization.id,
      studentId: student.id,
      invoiceNo: "INV-2026-001",
      amount: 145000,
      amountPaid: 145000,
      status: InvoiceStatus.PAID,
    },
  });
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
