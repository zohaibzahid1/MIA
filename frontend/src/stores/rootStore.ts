import { makeAutoObservable } from "mobx";
import { AuthStore } from "./authStore";
import { UserStore } from "./userStore";
import { PatientStore } from "./patientStore";
import { PatientDetailStore } from "./patientDetailStore";
import { ScanUploadStore } from "./scanUploadStore";
import { ScanResultStore } from "./scanResultStore";
import { AnalyticsStore } from "./analyticsStore";

export class RootStore {
  authStore: AuthStore;
  userStore: UserStore;
  patientStore: PatientStore;
  patientDetailStore: PatientDetailStore;
  scanUploadStore: ScanUploadStore;
  scanResultStore: ScanResultStore;
  analyticsStore: AnalyticsStore;

  constructor() {
    this.authStore = new AuthStore();
    this.userStore = new UserStore();
    this.patientStore = new PatientStore();
    this.patientDetailStore = new PatientDetailStore();
    this.scanUploadStore = new ScanUploadStore();
    this.scanResultStore = new ScanResultStore();
    this.analyticsStore = new AnalyticsStore();

    makeAutoObservable(this);
  }
}
