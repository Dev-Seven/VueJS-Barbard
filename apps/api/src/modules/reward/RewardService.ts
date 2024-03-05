import type {
  Redemption,
  RedemptionRepository,
} from "./RedemptionRepository.js";
import type { User } from "@barbaard/types";
export interface ConnectaRewardRedemptionRequest {
  PointBefore: number;
  PointAfter: number;
  DealInfo: {
    id: string; // connecta id
    redemptionId: string;
    customerId: string;
    status: string;
  };
  VoucherCode: string;
  User: {
    id: string;
    name: string;
    phone: string;
    birthday: string;
    email: string;
  };
}

import * as firestore from "firebase-admin/firestore";

export class RewardService {
  constructor(private redemptionRepo: RedemptionRepository) {}

  async addRedemption(
    request: ConnectaRewardRedemptionRequest,
    rewardId: string,
    user: { id: string; doc: User } | null,
  ) {
    const redemption: Redemption = {
      code: request.VoucherCode,
      connectaId: request.DealInfo.redemptionId,
      date: firestore.Timestamp.fromDate(new Date()),
      points: Number(request.PointBefore) - Number(request.PointAfter),
      pointsAfter: Number(request.PointAfter),
      pointsBefore: Number(request.PointBefore),
      rewardId: rewardId,
      userId: user?.id || "",
      userName: user?.doc.fullName || "",
    };
    const doc = await this.redemptionRepo.add(redemption);
    return doc.id;
  }
}
