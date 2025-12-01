import prisma from "../src/config/db";

async function main() {
  await prisma.subscriptionTier.createMany({
    data: [
      {
        name: 'Free',
        plan: 'FREE',
        price: 0,
        duration: 365,
        features: JSON.stringify(['Basic quality', 'Ads included']),
        maxDevices: 1,
      },
      {
        name: 'Premium Monthly',
        plan: 'PREMIUM_MONTHLY',
        price: 39000, // 39k VND/month
        duration: 30,
        features: JSON.stringify([
          'HD Audio',
          'No Ads',
          'Offline Download',
          'Lyrics',
        ]),
        maxDevices: 3,
      },
      {
        name: 'Premium Yearly',
        plan: 'PREMIUM_YEARLY',
        price: 390000, // 390k VND/year (save 2 months)
        duration: 365,
        features: JSON.stringify([
          'HD Audio',
          'No Ads',
          'Offline Download',
          'Lyrics',
        ]),
        maxDevices: 3,
      },
    ],
    skipDuplicates: true,
  });

  console.log('Subscription tiers seeded');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
