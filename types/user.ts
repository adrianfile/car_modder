export type Role = "USER" | "SUPERUSER";
export type SubscriptionTier = "FREE" | "PRO" | "ENTERPRISE";

export interface SessionUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  image: string | null;
  balance: number;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface ManagedUser {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  image: string | null;
  balance: number;
  isSubscribed: boolean;
  subscriptionTier: SubscriptionTier;
  createdAt: string;
  _count: {
    savedBuilds: number;
  };
}
