import { test } from '../fixtures/chainFixtures.js';

test.describe('Shopping Scenarios', () => {
    test('單一商品加入購物車與狀態驗證', async ({ loginPage, standardUserData, productPage }) => {
        // 1. 執行前置動作：登入
        await loginPage.login(standardUserData.username, standardUserData.password);

        // 2. 核心動作：加入指定商品到購物車
        const productName = 'Sauce Labs Backpack';
        await productPage.addProductToCart(productName);

        // --- 驗證點 (Assertion) ---

        // 驗證點 1: 確認商品頁面按鈕狀態改變
        await productPage.verifyItemButtonStatusIsRemove(productName);

        // 驗證點 2: 確認購物車圖示數量正確
        await productPage.verifyCartItemCount(1);
    });
    test('多商品加入購物車與狀態驗證', async ({ loginPage, standardUserData, productPage }) => {
        // 1. 執行前置動作：登入
        await loginPage.login(standardUserData.username, standardUserData.password);
        // 2. 核心動作：加入多個指定商品到購物車
        const productsToAdd = ['Sauce Labs Backpack', 'Sauce Labs Bike Light', 'Sauce Labs Bolt T-Shirt'];
        await productPage.addMultipleProductsToCart(productsToAdd);
        // --- 驗證點 (Assertion) ---
        // 驗證點 1: 確認商品頁面按鈕狀態改變
        await productPage.verifyMultipleItemsStatusIsRemove(productsToAdd);
        // 驗證點 2: 確認購物車圖示數量正確
        await productPage.verifyCartItemCount(productsToAdd.length);
    });
});