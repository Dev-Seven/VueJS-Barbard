import type { Admin, AdminRepository } from "./AdminRepository.js";
import * as firebase from "firebase-admin";

export class AdminService {
  constructor(
    private auth: firebase.auth.Auth,
    private repo: AdminRepository,
    private realtimeDb: firebase.database.Database,
  ) {}

  // https://barbaard.atlassian.net/browse/BF-54
  async onCreateAdmin(id: string, admin: Admin) {
    await Promise.all([
      async () => {
        await this.createAuthUser(id, admin);
        await this.resetPassword(id);
      },
      this.addUserToRealtimeDb(id, admin),
    ]);
  }

  async addUserToRealtimeDb(id: string, admin: Admin) {
    return this.realtimeDb.ref(`admins/${id}`).set(admin);
  }

  async removeUserFromRealtimeDb(id: string) {
    return this.realtimeDb.ref(`admins/${id}`).remove();
  }

  async onUpdateAdmin(id: string, after: Admin, before: Admin) {
    await Promise.all([
      this.checkAndResetPassword(id, after, before),
      this.addUserToRealtimeDb(id, after),
    ]);
  }

  async onDeleteAdmin(id: string) {
    await this.removeUserFromRealtimeDb(id);
  }

  async checkAndResetPassword(id: string, after: Admin, before: Admin) {
    console.log("admin update", id, {
      after: after.password,
      before: before.password,
    });
    if (after.password && before.password !== after.password) {
      console.log("reset password", after);
      const authUser = await this.auth.getUser(id).catch((err) => {
        console.log(err);
        return null;
      });
      if (authUser) {
        console.log("auth user", authUser.uid);
        await this.auth.updateUser(authUser.uid, {
          password: after.password,
        });
        await this.resetPassword(id);
      } else {
        await this.createAuthUser(id, after);
        await this.resetPassword(id);
      }
    }
  }

  async resetPassword(id: string) {
    console.log("reset password: ", id);
    await this.repo.update(id, {
      password: firebase.firestore.FieldValue.delete() as unknown as string,
    });
  }

  async createAuthUser(id: string, admin: Admin) {
    const user = await this.auth.createUser({
      uid: id,
      email: admin.email,
      password: admin.password,
    });
    console.log("created new auth user from admin:", user.uid);
    return user;
  }
}
