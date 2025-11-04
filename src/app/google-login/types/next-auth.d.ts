    // src/app/next-auth.d.ts
    import "next-auth";
    import { DefaultSession } from "next-auth";

    declare module "next-auth" {
    interface Session extends DefaultSession {
        accessToken?: string;
        refreshToken?: string;
        provider?: string;
        user: {
        id?: string;
        } & DefaultSession["user"];
    }

    interface JWT {
        accessToken?: string;
        refreshToken?: string;
        provider?: string;
        providerAccountId?: string;
        id?: string;
    }
    }

    interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
    }

    interface GoogleAccountsId {
    initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
    }): void;
    prompt(momentListener?: (notification: PromptMomentNotification) => void): void;
    cancel(): void;
    }

    interface GoogleAccounts {
    id: GoogleAccountsId;
    }

    interface Google {
    accounts: GoogleAccounts;
    }

    interface Window {
    google?: Google;
    }

    interface GoogleCredentialResponse {
    credential: string;
    select_by: string;
    }

    interface PromptMomentNotification {
    isDisplayMoment(): boolean;
    isDisplayed(): boolean;
    isNotDisplayed(): boolean;
    getNotDisplayedReason(): string;
    isSkippedMoment(): boolean;
    getSkippedReason(): string;
    isDismissedMoment(): boolean;
    getDismissedReason(): string;
    getMomentType(): string;
    }

    interface GoogleAccountsId {
    initialize(config: {
        client_id: string;
        callback: (response: GoogleCredentialResponse) => void;
        auto_select?: boolean;
        cancel_on_tap_outside?: boolean;
        context?: 'signin' | 'signup' | 'use';
        ux_mode?: 'popup' | 'redirect';
        login_uri?: string;
        itp_support?: boolean;
    }): void;
    prompt(momentListener?: (notification: PromptMomentNotification) => void): void;
    cancel(): void;
    renderButton(parent: HTMLElement, options: object): void;
    }

    interface GoogleAccounts {
    id: GoogleAccountsId;
    }

    interface Google {
    accounts: GoogleAccounts;
    }

    interface Window {
    google?: Google;
    }