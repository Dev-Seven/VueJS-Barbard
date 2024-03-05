// import { Trengo } from "../../clients/trengo.js";
// import { UserStoreService } from "../../userstore.js";
// export class AgreementService {
// 	constructor(
//		private userService: UserStoreService,
// 		private trengo: Trengo
//	) {}

// /agreements/{agreementId}
// async onCreateAgreement(agreementId: string, agreement: Agreement) {
//   if (agreement.users) {
//     const userPromises = agreement.users.map(async (userDoc: User) => {
//       const user = await this.userService.getUser(userDoc.userId);
//       if (user.trengoProfileId) {
//         await this.trengo.setCustomerField(
//           user.trengoProfileId,
//           CustomerFieldId.hasAgreement,
//           "yes"
//         );
//         await this.trengo.setCustomerField(
//           user.trengoProfileId,
//           CustomerFieldId.agreementServicesLeft,
//           agreement.left || 0
//         );
//       }
//     });
//     await Promise.all(userPromises);
//   }
// }

// async onUpdateAgreement(
//   agreementId: string,
//   agreement: Agreement,
//   before: Agreement
// ) {
//   if (agreement.users) {
//     const userPromises = agreement.users.map(async (userDoc: User) => {
//       const user = await this.userService.getUser(userDoc.userId);
//       if (user.trengoProfileId) {
//         const left = agreement.left || 0;
//         await this.trengo.setCustomerField(
//           user.trengoProfileId,
//           CustomerFieldId.agreementServicesLeft,
//           left
//         );
//         if (left > 0) {
//           const activeAgreements =
//             await this.userService.getAgreementsByActive(
//               userDoc.userId,
//               true,
//               1
//             );
//           if (activeAgreements.length === 0) {
//             await this.trengo.setCustomerField(
//               user.trengoProfileId,
//               CustomerFieldId.hasAgreement,
//               "no"
//             );
//           }
//         }
//       }
//     });
//     await Promise.all(userPromises);
//   }
// }
//}
