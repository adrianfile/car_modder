import { Role, SubscriptionTier } from "./user";

export interface RecentBuildItem {
  id: string;
  title: string;
  colorName: string;
  colorHex: string;
  finish: string;
  wheelName: string;
  caliperName: string;
  totalPrice: number;
  isPublic: boolean;
  status: string;
  createdAt: string;
}

export interface AdminRecentUser {
  id: string;
  name: string | null;
  email: string;
  role: Role | string;
  image: string | null;
  balance?: number;
  isSubscribed?: boolean;
  subscriptionTier?: SubscriptionTier;
  createdAt: string;
  _count: { savedBuilds: number };
}

export interface AdminStats {
  totalUsers: number;
  totalSuperusers: number;
  totalSubscribers: number;
  totalPlatformBalance: number;
  totalAllModels: number;
  recentUsers: AdminRecentUser[];
}

export interface DashboardStatsData {
  myModelsCount: number;
  myPublicModelsCount: number;
  unreadNotificationsCount: number;
  recentMyBuilds: RecentBuildItem[];
  admin: AdminStats | null;
}
