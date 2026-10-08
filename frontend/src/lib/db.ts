import Dexie, { Table } from 'dexie';

export interface Patient {
  id?: string;
  anonymousId: string;
  symptoms: string;
  vitals: any;
  urgency: string;
  createdAt: Date;
  synced: boolean;
}

export interface Consent {
  id?: string;
  patientId: string;
  consentType: string;
  granted: boolean;
  timestamp: Date;
}

const db = new Dexie('HealthTriageDB');

db.version(1).stores({
  patients: '++id, anonymousId, urgency, synced',
  consents: '++id, patientId, consentType',
});

export const patientsTable = db.table('patients') as Table<Patient>;
export const consentsTable = db.table('consents') as Table<Consent>;

export default db;
