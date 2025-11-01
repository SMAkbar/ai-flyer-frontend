"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DashboardStat } from "@/components/team/DashboardStat";
import { FlyerCard } from "@/components/flyers/FlyerCard";
import { userApi, type UserProfileRead } from "@/lib/api/user";
import { flyersApi, type FlyerRead } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";
import {
  LoaderIcon,
  ZapIcon,
  PlusIcon,
  ImageIcon,
  ProfileIcon,
  UsersIcon,
  TrendingUpIcon,
} from "@/components/icons";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfileRead | null>(null);
  const [flyers, setFlyers] = useState<FlyerRead[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  async function loadDashboardData() {
    setIsLoading(true);
    setError(null);

    try {
      const [userRes, flyersRes] = await Promise.all([
        userApi.getProfile(),
        flyersApi.getAll(),
      ]);

      if (userRes.ok) {
        setUser(userRes.data);
      }

      if (flyersRes.ok) {
        setFlyers(flyersRes.data);
      } else if (!userRes.ok) {
        setError(flyersRes.error.message || "Failed to load dashboard data");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  }

  const totalFlyers = flyers.length;
  const recentFlyers = flyers
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 4);

  const completedExtractions = flyers.length; // We'll count all flyers as potentially extracted
  const processingExtractions = 0; // Could be enhanced with actual extraction status

  const getUserDisplayName = () => {
    if (user?.full_name) return user.full_name;
    if (user?.first_name) return user.first_name;
    return user?.email?.split("@")[0] || "User";
  };

  if (isLoading) {
    return (
      <div
        style={{
          width: "90%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          color: tokens.textSecondary,
          fontSize: "16px",
        }}
      >
        <LoaderIcon size={20} color="currentColor" />
        Loading dashboard...
          <style jsx>{`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (error && !user && flyers.length === 0) {
    return (
      <div
        style={{
          width: "90%",
          maxWidth: "1600px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "400px",
          gap: "16px",
        }}
      >
        <div
          style={{
            color: tokens.danger,
            fontSize: "16px",
            marginBottom: "8px",
          }}
        >
          {error}
        </div>
        <Button onClick={loadDashboardData}>Retry</Button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      {/* Welcome Section */}
      <div
        style={{
          marginBottom: "40px",
        }}
      >
        <h1
          style={{
            fontSize: "40px",
            fontWeight: 700,
            color: tokens.textPrimary,
            marginBottom: "12px",
            letterSpacing: "-0.02em",
          }}
        >
          Welcome back, {getUserDisplayName()}! 👋
        </h1>
        <p
          style={{
            fontSize: "16px",
            color: tokens.textSecondary,
            margin: 0,
            lineHeight: 1.5,
          }}
        >
          Here's what's happening with your flyers and account today.
        </p>
      </div>

      {/* Stats Section */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 240px), 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
      >
        <DashboardStat
          label="Total Flyers"
          value={totalFlyers.toString()}
          color={tokens.accent}
        />
        <DashboardStat
          label="Recent Flyers"
          value={recentFlyers.length.toString()}
          color={tokens.success}
        />
        <DashboardStat
          label="Extractions"
          value={completedExtractions.toString()}
          color={tokens.textPrimary}
        />
        <DashboardStat
          label="Processing"
          value={processingExtractions.toString()}
          color={processingExtractions > 0 ? tokens.warning : tokens.textMuted}
        />
      </div>

      {/* Quick Actions Section */}
      <Card
        style={{
          backgroundColor: tokens.bgElevated,
          border: `1px solid ${tokens.border}`,
          borderRadius: "20px",
          padding: "32px",
          marginBottom: "40px",
        }}
      >
        <h2
          style={{
            fontSize: "20px",
            fontWeight: 600,
            color: tokens.textPrimary,
            marginBottom: "24px",
            letterSpacing: "-0.01em",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <ZapIcon size={20} color="currentColor" />
          Quick Actions
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 200px), 1fr))",
            gap: "16px",
          }}
        >
          <Button
            onClick={() => router.push("/flyers/create")}
            style={{
              justifyContent: "flex-start",
              padding: "16px 20px",
              height: "auto",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <PlusIcon size={20} color="currentColor" />
              <span>Create Flyer</span>
            </span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/flyers")}
            style={{
              justifyContent: "flex-start",
              padding: "16px 20px",
              height: "auto",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <ImageIcon size={20} color="currentColor" />
              <span>View All Flyers</span>
            </span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/profile")}
            style={{
              justifyContent: "flex-start",
              padding: "16px 20px",
              height: "auto",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <ProfileIcon size={20} color="currentColor" />
              <span>Edit Profile</span>
            </span>
          </Button>
          <Button
            variant="secondary"
            onClick={() => router.push("/theme")}
            style={{
              justifyContent: "flex-start",
              padding: "16px 20px",
              height: "auto",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "10px", width: "100%" }}>
              <UsersIcon size={20} color="currentColor" />
              <span>Theme</span>
            </span>
          </Button>
        </div>
      </Card>

      {/* Recent Flyers Section */}
      {recentFlyers.length > 0 ? (
        <div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "16px",
            }}
          >
            <h2
              style={{
                fontSize: "24px",
                fontWeight: 600,
                color: tokens.textPrimary,
                margin: 0,
                letterSpacing: "-0.01em",
                display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <TrendingUpIcon size={24} color="currentColor" />
            Recent Flyers
          </h2>
            <Button variant="secondary" onClick={() => router.push("/flyers")}>
              View All
            </Button>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: "24px",
            }}
          >
            {recentFlyers.map((flyer) => (
              <FlyerCard key={flyer.id} flyer={flyer} />
            ))}
          </div>
        </div>
      ) : (
        <Card
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.border}`,
            borderRadius: "20px",
            padding: "60px 24px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 24px",
              borderRadius: "20px",
              backgroundColor: tokens.bgHover,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              border: `2px solid ${tokens.border}`,
            }}
            >
              <ImageIcon size={40} color={tokens.textMuted} />
            </div>
          <h3
            style={{
              fontSize: "20px",
              fontWeight: 600,
              color: tokens.textPrimary,
              marginBottom: "8px",
            }}
          >
            No flyers yet
          </h3>
          <p
            style={{
              fontSize: "15px",
              color: tokens.textSecondary,
              marginBottom: "24px",
            }}
          >
            Create your first flyer to get started!
          </p>
          <Button onClick={() => router.push("/flyers/create")}>
            <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <PlusIcon size={18} color="currentColor" />
              Create Your First Flyer
            </span>
          </Button>
        </Card>
      )}
    </div>
  );
}


