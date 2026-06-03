import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash("123456", 10);

  const users = [
    {
      id: "user-1",
      name: "Ana Paula",
      email: "ana.paula@goride.com",
      cpf: "11111111111",
      phone: "(82) 99999-1111",
      gender: "Feminino",
      birthDate: "1998-03-15",
      passwordHash,
    },
    {
      id: "user-2",
      name: "Carlos Silva",
      email: "carlos.silva@goride.com",
      cpf: "22222222222",
      phone: "(82) 99999-2222",
      gender: "Masculino",
      birthDate: "1997-07-22",
      passwordHash,
    },
    {
      id: "user-3",
      name: "Maria Oliveira",
      email: "maria.oliveira@goride.com",
      cpf: "33333333333",
      phone: "(82) 99999-3333",
      gender: "Feminino",
      birthDate: "1999-11-08",
      passwordHash,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: user,
      create: user,
    });
  }

  const rides = [
    {
      id: "ride-1",
      driverId: "user-2",
      origin: "Centro - Maceio",
      destination: "UFAL - Campus A.C. Simoes",
      date: "2026-05-04",
      departureTimeStart: "08:15",
      departureTimeEnd: "08:45",
      price: 8.5,
      totalSeats: 4,
      availableSeats: 3,
      routeName: "Via Fernandes Lima",
      sameGenderOnly: false,
      status: "completed",
    },
    {
      id: "ride-2",
      driverId: "user-1",
      origin: "Jatiuca",
      destination: "UFAL - Campus A.C. Simoes",
      date: "2026-06-10",
      departureTimeStart: "07:30",
      departureTimeEnd: "08:00",
      price: 7,
      totalSeats: 3,
      availableSeats: 2,
      routeName: "Via Durval de Goes Monteiro",
      sameGenderOnly: false,
      status: "active",
    },
  ];

  for (const ride of rides) {
    await prisma.ride.upsert({
      where: { id: ride.id },
      update: ride,
      create: ride,
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
