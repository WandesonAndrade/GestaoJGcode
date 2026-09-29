import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  query, 
  where 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import type { Client, Project, Payment } from '../types';
import { StorageService } from './storageService';

const COLLECTIONS = {
  CLIENTS: 'clients',
  PROJECTS: 'projects',
  PLANS: 'plans',
  PAYMENTS: 'payments',
};

export class FirestoreService {
  /**
   * Verifica se o Firebase está ativo e conectado
   */
  static isAvailable(): boolean {
    return isFirebaseConfigured && Boolean(db);
  }

  /**
   * Remove quaisquer documentos de demonstração legados do Firestore
   */
  static async cleanupLegacyDemoFromFirestore(): Promise<void> {
    if (!this.isAvailable() || !db) return;

    try {
      const demoClientIds = ['cli-1', 'cli-2'];
      const demoProjectIds = ['proj-1', 'proj-2', 'proj-3'];
      const demoPlanIds = ['plan-1', 'plan-2', 'plan-3'];
      const demoPaymentIds = ['pay-1', 'pay-2', 'pay-3', 'pay-4'];

      for (const id of demoClientIds) {
        await deleteDoc(doc(db, COLLECTIONS.CLIENTS, id)).catch(() => {});
      }
      for (const id of demoProjectIds) {
        await deleteDoc(doc(db, COLLECTIONS.PROJECTS, id)).catch(() => {});
      }
      for (const id of demoPlanIds) {
        await deleteDoc(doc(db, COLLECTIONS.PLANS, id)).catch(() => {});
      }
      for (const id of demoPaymentIds) {
        await deleteDoc(doc(db, COLLECTIONS.PAYMENTS, id)).catch(() => {});
      }
    } catch {
      // Ignora se não houver registros ou se não for possível deletar
    }
  }

  // --- CLIENTES ---
  static async getClients(): Promise<Client[]> {
    if (!this.isAvailable() || !db) return StorageService.getClients();

    try {
      const snapshot = await getDocs(collection(db, COLLECTIONS.CLIENTS));
      const clients: Client[] = [];
      snapshot.forEach((d) => clients.push(d.data() as Client));
      return clients.length > 0 ? clients : StorageService.getClients();
    } catch (e) {
      console.warn('Erro ao buscar clientes no Firestore, usando fallback local:', e);
      return StorageService.getClients();
    }
  }

  static async saveClient(client: Client): Promise<void> {
    if (!this.isAvailable() || !db) return;
    try {
      await setDoc(doc(db, COLLECTIONS.CLIENTS, client.id), client);
    } catch (e) {
      console.warn('Erro ao salvar cliente no Firestore:', e);
    }
  }

  // --- PROJETOS ---
  static async getProjects(clientId?: string): Promise<Project[]> {
    if (!this.isAvailable() || !db) return StorageService.getProjects(clientId);

    try {
      const colRef = collection(db, COLLECTIONS.PROJECTS);
      const q = clientId ? query(colRef, where('clientId', '==', clientId)) : colRef;
      const snapshot = await getDocs(q);
      const projects: Project[] = [];
      snapshot.forEach((d) => projects.push(d.data() as Project));
      return projects.length > 0 ? projects : StorageService.getProjects(clientId);
    } catch (e) {
      console.warn('Erro ao buscar projetos no Firestore, usando fallback local:', e);
      return StorageService.getProjects(clientId);
    }
  }

  static async saveProject(project: Project): Promise<void> {
    if (!this.isAvailable() || !db) return;
    try {
      await setDoc(doc(db, COLLECTIONS.PROJECTS, project.id), project);
    } catch (e) {
      console.warn('Erro ao salvar projeto no Firestore:', e);
    }
  }

  // --- PAGAMENTOS ---
  static async getPayments(clientId?: string): Promise<Payment[]> {
    if (!this.isAvailable() || !db) return StorageService.getPayments(clientId);

    try {
      const colRef = collection(db, COLLECTIONS.PAYMENTS);
      const q = clientId ? query(colRef, where('clientId', '==', clientId)) : colRef;
      const snapshot = await getDocs(q);
      const payments: Payment[] = [];
      snapshot.forEach((d) => payments.push(d.data() as Payment));
      return payments.length > 0 ? payments : StorageService.getPayments(clientId);
    } catch (e) {
      console.warn('Erro ao buscar pagamentos no Firestore, usando fallback local:', e);
      return StorageService.getPayments(clientId);
    }
  }

  static async updatePaymentStatus(paymentId: string, status: Payment['status'], paidAt?: string, gatewayId?: string): Promise<void> {
    if (!this.isAvailable() || !db) return;
    try {
      const ref = doc(db, COLLECTIONS.PAYMENTS, paymentId);
      const updateData: Partial<Payment> = { status };
      if (paidAt) updateData.paidAt = paidAt;
      if (gatewayId) updateData.gatewayId = gatewayId;
      await updateDoc(ref, updateData);
    } catch (e) {
      console.warn('Erro ao atualizar status do pagamento no Firestore:', e);
    }
  }
}
