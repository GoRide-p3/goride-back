import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const users = [
  {
    id: "user-1",
    name: "Ana Paula",
    email: "anapaula@gmail.com",
    phone: "(82) 99999-8888",
    gender: "Feminino",
    rating: 4.8,
    totalRatings: 47,
  },
  {
    id: "user-2",
    name: "Carlos Silva",
    email: "carlos@gmail.com",
    phone: "(82) 99888-7777",
    gender: "Masculino",
    rating: 4.9,
    totalRatings: 128,
  },
  {
    id: "user-11",
    name: "Maria Santos",
    email: "maria.santos@gmail.com",
    phone: "(82) 98000-1111",
    gender: "Feminino",
    rating: 4.9,
    totalRatings: 203,
  },
  {
    id: "user-12",
    name: "Joao Pedro",
    email: "joao.pedro@gmail.com",
    phone: "(82) 98000-2222",
    gender: "Masculino",
    rating: 4.7,
    totalRatings: 89,
  },
  {
    id: "user-14",
    name: "Pedro Henrique",
    email: "pedro.henrique@gmail.com",
    phone: "(82) 98000-4444",
    gender: "Masculino",
    rating: 4.6,
    totalRatings: 94,
  },
];

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
    routeId: "route-1",
    routeName: "Via Fernao Dias",
    sameGenderOnly: false,
    status: "active",
  },
  {
    id: "ride-2",
    driverId: "user-11",
    origin: "Pajucara",
    destination: "UFAL - Campus A.C. Simoes",
    date: "2026-05-04",
    departureTimeStart: "09:00",
    departureTimeEnd: "09:30",
    price: 7,
    totalSeats: 4,
    availableSeats: 2,
    routeId: "route-2",
    routeName: "Via Avenida Durval de Goes Monteiro",
    sameGenderOnly: false,
    status: "active",
  },
  {
    id: "ride-3",
    driverId: "user-12",
    origin: "Ponta Verde",
    destination: "UFAL - Campus A.C. Simoes",
    date: "2026-05-05",
    departureTimeStart: "09:45",
    departureTimeEnd: "10:15",
    price: 9,
    totalSeats: 1,
    availableSeats: 1,
    routeId: "route-3",
    routeName: "Via Alvaro Otacilio",
    sameGenderOnly: false,
    status: "active",
  },
  {
    id: "ride-4",
    driverId: "user-14",
    origin: "UFAL - Campus A.C. Simoes",
    destination: "Farol",
    date: "2026-05-09",
    departureTimeStart: "18:45",
    departureTimeEnd: "19:15",
    price: 8.5,
    totalSeats: 4,
    availableSeats: 1,
    routeId: "route-4",
    routeName: "Via Avenida Fernandes Lima",
    sameGenderOnly: false,
    status: "active",
  },
];

async function main() {
  for (const user of users) {
    await prisma.user.upsert({
      where: { id: user.id },
      update: user,
      create: user,
    });
  }

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
