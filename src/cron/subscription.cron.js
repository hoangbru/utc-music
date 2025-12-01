import cron from "node-cron";
import prisma from "../config/db.js";
import { SUBSCRIPTION_STATUS } from "../constants/payment.js";

/**
 * Check and update expired subscriptions
 * Runs every day at 00:00
 */
export function startSubscriptionCronJob() {
  // Schedule: Every day at midnight (00:00)
  // Format: second minute hour day month weekday
  cron.schedule("0 0 * * *", async () => {
    console.log("Running subscription expiry check...");

    try {
      const count = await checkExpiredSubscriptions();
      console.log(`Updated ${count} expired subscriptions`);
    } catch (error) {
      console.error("Error checking subscriptions:", error);
    }
  });

  console.log("Subscription cron job started");
}

async function checkExpiredSubscriptions() {
  const now = new Date();

  // Find all active subscriptions that have passed their end date
  const expiredSubscriptions = await prisma.userSubscription.findMany({
    where: {
      status: SUBSCRIPTION_STATUS.ACTIVE,
      endDate: {
        lt: now,
      },
    },
  });

  for (const subscription of expiredSubscriptions) {
    await prisma.userSubscription.update({
      where: { id: subscription.id },
      data: { status: SUBSCRIPTION_STATUS.EXPIRED },
    });

    await prisma.user.update({
      where: { id: subscription.userId },
      data: {
        isPremium: false,
        premiumUntil: null,
      },
    });

    console.log(`User ${subscription.userId} premium expired`);
  }

  return expiredSubscriptions.length;
}

/**
 * Manual trigger for testing
 */
export async function manualCheckExpiredSubscriptions() {
  console.log("Manually checking expired subscriptions...");
  const count = await checkExpiredSubscriptions();
  console.log(`Updated ${count} expired subscriptions`);
  return count;
}
