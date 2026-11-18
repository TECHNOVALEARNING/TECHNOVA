import { describe, expect, it, vi } from "vitest";
import type { User } from "@supabase/supabase-js";

// Évite de charger le vrai client Supabase (il exige les variables d'environnement)
vi.mock("@/contexts/AuthContext", () => ({ useAuth: () => ({}) }));

import { isApprovedSeller } from "./ProtectedRoute";

const user = (createdAt: string, appMetadata: Record<string, unknown> = {}) =>
  ({ id: "u1", created_at: createdAt, app_metadata: appMetadata }) as unknown as User;

const BEFORE = "2026-08-01T00:00:00Z";
const AFTER = "2026-11-10T00:00:00Z";

describe("isApprovedSeller", () => {
  it("refuse un compte acheteur créé avant la date limite sans onboarding vendeur", () => {
    expect(isApprovedSeller(user(BEFORE), false, { onboarding_completed: false })).toBe(false);
    expect(isApprovedSeller(user(BEFORE), false, null)).toBe(false);
  });

  it("accepte un ancien vendeur qui a terminé son onboarding", () => {
    expect(isApprovedSeller(user(BEFORE), false, { onboarding_completed: true })).toBe(true);
  });

  it("refuse un nouveau compte non activé par l'admin", () => {
    expect(isApprovedSeller(user(AFTER), false, { onboarding_completed: true })).toBe(false);
  });

  it("accepte un compte activé par l'admin", () => {
    expect(isApprovedSeller(user(AFTER, { seller: true }), false, null)).toBe(true);
  });

  it("refuse un compte vendeur fermé, sauf s'il est réactivé par l'admin", () => {
    const closed = { seller: false, seller_closed_at: AFTER };
    expect(isApprovedSeller(user(BEFORE, closed), false, { onboarding_completed: true })).toBe(
      false,
    );
    expect(isApprovedSeller(user(BEFORE, { ...closed, seller: true }), false, null)).toBe(true);
  });

  it("accepte toujours l'administrateur", () => {
    expect(isApprovedSeller(user(AFTER), true, null)).toBe(true);
  });
});
