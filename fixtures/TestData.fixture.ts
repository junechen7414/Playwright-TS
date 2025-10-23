import { test as baseTest } from '@playwright/test';

type UserCredential = {
    username: string;
    password: string;
}

const credentials = {
    standard: { username: "standard_user", password: "secret_sauce" },
    lockedOut: { username: "locked_out_user", password: "secret_sauce" },
    invalid: { username: "invalid_user", password: "invalid_password" },
} as const;

type DataFixtures = {
    standardUserData: UserCredential;
    lockedUserData: UserCredential;
    invalidUserData: UserCredential;
};

export const dataTest = baseTest.extend<DataFixtures>({
    standardUserData: async ({}, use) => {
        await use({ ...credentials.standard });
    },
    lockedUserData: async ({}, use) => {
        await use({ ...credentials.lockedOut });
    },
    invalidUserData: async ({}, use) => {
        await use({ ...credentials.invalid });
    },
});