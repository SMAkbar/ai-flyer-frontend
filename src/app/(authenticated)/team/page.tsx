'use client';
import React from "react";
import { tokens } from "@/components/theme/tokens";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Icon } from "@/components/ui/Icon";
import { Card } from "@/components/ui/Card";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { DashboardStat } from "@/components/team/DashboardStat";

export default function TeamPage() {
  return (
    <main style={{ backgroundColor: tokens.bgBase, color: tokens.textPrimary, minHeight: "100vh" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 24px", display: "grid", gap: 24 }}>
        <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div>
            <h1 style={{ margin: 0, fontSize: 32, lineHeight: 1.2, fontWeight: 700 }}>Our Team & Component Gallery</h1>
            <p style={{ marginTop: 8, color: tokens.textSecondary }}>Dark theme showcase: typography, icons, inputs, cards, and dashboard widgets.</p>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button>Get in touch</Button>
            <Button variant="secondary">Download profile</Button>
          </div>
        </header>

        <Section title="Team" subtitle="People who build the experience.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            <TeamMemberCard name="Ava Johnson" role="Product Designer" />
            <TeamMemberCard name="Liam Chen" role="Frontend Engineer" />
            <TeamMemberCard name="Noah Patel" role="Backend Engineer" />
            <TeamMemberCard name="Mia Garcia" role="UX Researcher" />
          </div>
        </Section>

        <Section title="Icons" subtitle="Inline SVGs suitable for dark backgrounds.">
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Icon path="M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v3h16v-3c0-2.761-3.582-5-8-5Z" />
            <Icon path="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 21.49 21.49 20l-5.99-6Z M10.5 15A4.5 4.5 0 1 1 10.5 6a4.5 4.5 0 0 1 0 9Z" />
            <Icon path="M8 5v14l11-7L8 5Z" />
            <Icon path="M12 22a2 2 0 0 0 2-2H10a2 2 0 0 0 2 2Zm6-6V11a6 6 0 1 0-12 0v5l-2 2v1h16v-1l-2-2Z" />
            <Icon path="M9 16.17 4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z" color={tokens.success} />
            <Icon path="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z" color={tokens.warning} />
          </div>
        </Section>

        <Section title="Inputs & Buttons" subtitle="Form elements with accessible contrast and focus.">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
            <div>
              <label htmlFor="search" style={{ display: "block", marginBottom: 8, color: tokens.textSecondary }}>Search</label>
              <div style={{ position: "relative" }}>
                <Input id="search" placeholder="Search the catalog" />
                <div style={{ position: "absolute", right: 10, top: 8 }}>
                  <Icon path="M15.5 14h-.79l-.28-.27A6.5 6.5 0 1 0 14 15.5l.27.28v.79L20 21.49 21.49 20l-5.99-6Z M10.5 15A4.5 4.5 0 1 1 10.5 6a4.5 4.5 0 0 1 0 9Z" size={20} color={tokens.textMuted} />
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="email" style={{ display: "block", marginBottom: 8, color: tokens.textSecondary }}>Email</label>
              <Input id="email" type="email" placeholder="you@company.com" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <Button>Primary action</Button>
            <Button variant="secondary">Secondary action</Button>
          </div>
        </Section>

        <Section title="Cards" subtitle="Content cards with hover elevation.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} hoverElevate>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <Icon path="M8 5v14l11-7L8 5Z" color={tokens.textSecondary} />
                  <div style={{ fontWeight: 600 }}>Featured Item {i}</div>
                </div>
                <div style={{ color: tokens.textSecondary, fontSize: 14 }}>Cinematic description for the featured content card in a dark UI.</div>
              </Card>
            ))}
          </div>
        </Section>

        <Section title="Dashboard" subtitle="Compact KPI widgets.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
            <DashboardStat label="Active Users" value="12,842" trend="up" color={tokens.textPrimary} />
            <DashboardStat label="Conversion Rate" value="4.8%" trend="up" color={tokens.success} />
            <DashboardStat label="Churn" value="2.3%" trend="down" color={tokens.danger} />
            <DashboardStat label="Support Tickets" value="128" color={tokens.warning} />
          </div>
        </Section>

        <footer style={{ backgroundColor: tokens.bgElevated, border: `1px solid ${tokens.border}`, borderRadius: 12, padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ color: tokens.textSecondary }}>Built with the dark theme design language.</div>
          <div style={{ display: "flex", gap: 8 }}>
            <Button variant="secondary">View Docs</Button>
            <Button>Start a project</Button>
          </div>
        </footer>
      </div>
    </main>
  );
}
