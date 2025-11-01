'use client';
import React from "react";
import { tokens } from "@/components/theme/tokens";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Card } from "@/components/ui/Card";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { DashboardStat } from "@/components/team/DashboardStat";
import {
  MessageIcon,
  DownloadIcon,
  SearchIcon,
  PlayIcon,
  CheckIcon,
  WarningIcon,
  FileIcon,
  ZapIcon,
  ProfileIcon,
  BellIcon,
} from "@/components/icons";

export default function TeamPage() {
  return (
    <main style={{ backgroundColor: tokens.bgBase, color: tokens.textPrimary, minHeight: "100vh" }}>
      <div
        style={{
          width: "90%",
          maxWidth: "1600px",
          margin: "0 auto",
          padding: "32px 24px",
          display: "grid",
          gap: "32px",
        }}
      >
        <header
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "24px",
            marginBottom: "8px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 1, minWidth: "300px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "40px",
                lineHeight: 1.2,
                fontWeight: 700,
                color: tokens.textPrimary,
                letterSpacing: "-0.02em",
                marginBottom: "12px",
              }}
            >
              Our Team
            </h1>
            <p
              style={{
                marginTop: 0,
                color: tokens.textSecondary,
                fontSize: "16px",
                lineHeight: 1.5,
                maxWidth: "600px",
              }}
            >
              Meet the talented people who build exceptional experiences. Explore our component gallery showcasing modern UI elements and design patterns.
            </p>
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <MessageIcon size={18} color="currentColor" />
                Get in touch
              </span>
            </Button>
            <Button variant="secondary">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <DownloadIcon size={18} color="currentColor" />
                Download profile
              </span>
            </Button>
          </div>
        </header>

        <Section title="Team Members" subtitle="The talented people behind our success">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "20px",
            }}
          >
            <TeamMemberCard name="Ava Johnson" role="Product Designer" />
            <TeamMemberCard name="Liam Chen" role="Frontend Engineer" />
            <TeamMemberCard name="Noah Patel" role="Backend Engineer" />
            <TeamMemberCard name="Mia Garcia" role="UX Researcher" />
            <TeamMemberCard name="Emma Wilson" role="DevOps Engineer" />
            <TeamMemberCard name="James Brown" role="Data Scientist" />
          </div>
        </Section>

        <Section title="Component Gallery" subtitle="UI elements and icons">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 300px), 1fr))",
              gap: "20px",
            }}
          >
            <Card
              style={{
                padding: "24px",
                backgroundColor: tokens.bgElevated,
                border: `1px solid ${tokens.border}`,
                borderRadius: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: tokens.textPrimary,
                  marginBottom: "16px",
                  marginTop: 0,
                }}
                >
                Icons
              </h3>
              <div
                style={{
                  display: "flex",
                  gap: "16px",
                  alignItems: "center",
                  flexWrap: "wrap",
                  padding: "16px",
                  backgroundColor: tokens.bgHover,
                  borderRadius: "12px",
                  border: `1px solid ${tokens.border}`,
                }}
              >
                <ProfileIcon size={24} color="currentColor" />
                <SearchIcon size={24} color="currentColor" />
                <PlayIcon size={24} color="currentColor" />
                <BellIcon size={24} color="currentColor" />
                <CheckIcon size={24} color={tokens.success} />
                <WarningIcon size={24} color={tokens.warning} />
              </div>
            </Card>

            <Card
              style={{
                padding: "24px",
                backgroundColor: tokens.bgElevated,
                border: `1px solid ${tokens.border}`,
                borderRadius: "16px",
              }}
            >
              <h3
                style={{
                  fontSize: "14px",
                  fontWeight: 600,
                  color: tokens.textPrimary,
                  marginBottom: "20px",
                  marginTop: 0,
                }}
              >
                Form Elements
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div>
                  <label
                    htmlFor="search"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: tokens.textPrimary,
                    }}
                  >
                    Search
                  </label>
                  <div style={{ position: "relative" }}>
                    <Input id="search" placeholder="Search the catalog" />
                    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                      <SearchIcon size={18} color={tokens.textMuted} />
                    </div>
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    style={{
                      display: "block",
                      marginBottom: "8px",
                      fontSize: "13px",
                      fontWeight: 500,
                      color: tokens.textPrimary,
                    }}
                  >
                    Email
                  </label>
                  <Input id="email" type="email" placeholder="you@company.com" />
                </div>
                <div style={{ display: "flex", gap: "12px", marginTop: "8px", flexWrap: "wrap" }}>
                  <Button>Primary action</Button>
                  <Button variant="secondary">Secondary action</Button>
                </div>
              </div>
            </Card>
          </div>
        </Section>

        <Section title="Cards & Content" subtitle="Interactive cards with hover effects">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 280px), 1fr))",
              gap: "20px",
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} hoverElevate>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "10px",
                      backgroundColor: tokens.bgHover,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: `1px solid ${tokens.border}`,
                    }}
                  >
                    <PlayIcon size={24} color={tokens.accent} />
                  </div>
                  <div style={{ fontWeight: 600, fontSize: "15px", color: tokens.textPrimary }}>Featured Item {i}</div>
                </div>
                <div style={{ color: tokens.textSecondary, fontSize: "14px", lineHeight: 1.5 }}>
                  Cinematic description for the featured content card in a dark UI.
                </div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Dashboard Metrics" subtitle="Key performance indicators">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(min(100%, 260px), 1fr))",
              gap: "20px",
            }}
          >
            <DashboardStat label="Active Users" value="12,842" trend="up" color={tokens.textPrimary} />
            <DashboardStat label="Conversion Rate" value="4.8%" trend="up" color={tokens.success} />
            <DashboardStat label="Churn Rate" value="2.3%" trend="down" color={tokens.danger} />
            <DashboardStat label="Support Tickets" value="128" color={tokens.warning} />
            <DashboardStat label="Revenue" value="$142K" trend="up" color={tokens.accent} />
            <DashboardStat label="Growth" value="+12%" trend="up" color={tokens.success} />
          </div>
        </Section>

        <footer
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.border}`,
            borderRadius: "16px",
            padding: "32px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "24px",
            flexWrap: "wrap",
            marginTop: "8px",
          }}
        >
          <div style={{ color: tokens.textSecondary, fontSize: "15px" }}>
            Built with modern design principles and a focus on user experience.
          </div>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <Button variant="secondary">
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <FileIcon size={18} color="currentColor" />
                View Docs
              </span>
            </Button>
            <Button>
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <ZapIcon size={18} color="currentColor" />
                Start a project
              </span>
            </Button>
          </div>
        </footer>
      </div>
    </main>
  );
}
