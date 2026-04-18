"use client";

import { useEffect, useMemo, useState } from "react";
import { Profile } from "./types";

const DEFAULT_PROFILE: Profile = {
  allergies: ["gelatin"],
  sensitivities: ["sugar alcohols"],
  dietary_preferences: ["vegetarian"],
  health_goals: ["sleep", "stress"],
  medications: [],
  conditions: [],
};

function join(items: string[]) {
  return items.join(", ");
}

function parse(input: string) {
  return input.split(",").map((x) => x.trim()).filter(Boolean);
}

export default function ProfileForm({ onChange }: { onChange?: (profile: Profile) => void }) {
  const [allergies, setAllergies] = useState(join(DEFAULT_PROFILE.allergies));
  const [sensitivities, setSensitivities] = useState(join(DEFAULT_PROFILE.sensitivities));
  const [dietaryPreferences, setDietaryPreferences] = useState(join(DEFAULT_PROFILE.dietary_preferences));
  const [healthGoals, setHealthGoals] = useState(join(DEFAULT_PROFILE.health_goals));
  const [medications, setMedications] = useState("");
  const [conditions, setConditions] = useState("");
  const [saved, setSaved] = useState(false);

  const profile = useMemo<Profile>(() => ({
    allergies: parse(allergies),
    sensitivities: parse(sensitivities),
    dietary_preferences: parse(dietaryPreferences),
    health_goals: parse(healthGoals),
    medications: parse(medications),
    conditions: parse(conditions),
  }), [allergies, sensitivities, dietaryPreferences, healthGoals, medications, conditions]);

  useEffect(() => {
    const existing = typeof window !== "undefined" ? window.localStorage.getItem("medlens-profile") : null;
    if (existing) {
      try {
        const data = JSON.parse(existing) as Profile;
        setAllergies(join(data.allergies || []));
        setSensitivities(join(data.sensitivities || []));
        setDietaryPreferences(join(data.dietary_preferences || []));
        setHealthGoals(join(data.health_goals || []));
        setMedications(join(data.medications || []));
        setConditions(join(data.conditions || []));
      } catch {}
    }
  }, []);

  useEffect(() => {
    onChange?.(profile);
  }, [profile, onChange]);

  function saveProfile() {
    window.localStorage.setItem("medlens-profile", JSON.stringify(profile));
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="profile-grid">
      <div className="field"><label>Allergies</label><input value={allergies} onChange={(e) => setAllergies(e.target.value)} placeholder="gelatin, dairy, gluten" /></div>
      <div className="field"><label>Sensitivities</label><input value={sensitivities} onChange={(e) => setSensitivities(e.target.value)} placeholder="caffeine, sugar alcohols" /></div>
      <div className="field"><label>Dietary preferences</label><input value={dietaryPreferences} onChange={(e) => setDietaryPreferences(e.target.value)} placeholder="vegetarian, halal" /></div>
      <div className="field"><label>Health goals</label><input value={healthGoals} onChange={(e) => setHealthGoals(e.target.value)} placeholder="sleep, stress, energy" /></div>
      <div className="field"><label>Medications</label><input value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="metformin, sertraline" /></div>
      <div className="field"><label>Conditions</label><input value={conditions} onChange={(e) => setConditions(e.target.value)} placeholder="hypertension, GERD" /></div>
      <div className="actions-row span-full">
        <button className="button button-primary" type="button" onClick={saveProfile}>Save profile</button>
        {saved ? <span className="success-text">Saved to browser</span> : null}
      </div>
    </div>
  );
}
