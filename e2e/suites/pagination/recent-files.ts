/*!
 * @license
 * Alfresco Example Content Application
 *
 * Copyright (C) 2005 - 2020 Alfresco Software Limited
 *
 * This file is part of the Alfresco Example Content Application.
 * If the software was purchased under a paid Alfresco license, the terms of
 * the paid license agreement will prevail.  Otherwise, the software is
 * provided under the following open source license terms:
 *
 * The Alfresco Example Content Application is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * The Alfresco Example Content Application is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Alfresco. If not, see <http://www.gnu.org/licenses/>.
 */

import { BrowsingPage, Utils } from '@alfresco/aca-testing-shared';
import { LoginPage } from '@alfresco/adf-testing';

export function recentFilesTests(username: string) {
  const page = new BrowsingPage();
  const loginPage = new LoginPage();
  const { dataTable, pagination } = page;

  describe('Pagination controls : ', () => {
    beforeAll(async () => {
      await loginPage(user.email, user.password);
      await page.clickRecentFilesAndWait();
    });

    afterEach(async () => {
      await Utils.pressEscape();
    });

    it('Pagination control default values - [C280104]', async () => {
      expect(await pagination.getRange()).toContain('1-25 of 101');
      expect(await pagination.getMaxItems()).toContain('25');
      expect(await pagination.getCurrentPage()).toContain('Page 1');
      expect(await pagination.getTotalPages()).toContain('of 5');
      expect(await pagination.isPreviousEnabled()).toBe(false, 'Previous button is enabled');
      expect(await pagination.isNextEnabled()).toBe(true, 'Next button is not enabled');
    });

    it('Items per page values - [C280105]', async () => {
      await pagination.openMaxItemsMenu();
      expect(await pagination.menu.getNthItem(1).getText()).toBe('25');
      expect(await pagination.menu.getNthItem(2).getText()).toBe('50');
      expect(await pagination.menu.getNthItem(3).getText()).toBe('100');
      await pagination.menu.closeMenu();
    });

    it('current page menu items - [C280106]', async () => {
      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('25');
      expect(await pagination.getMaxItems()).toContain('25');
      expect(await pagination.getTotalPages()).toContain('of 5');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(5);
      await pagination.menu.closeMenu();

      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('50');
      expect(await pagination.getMaxItems()).toContain('50');
      expect(await pagination.getTotalPages()).toContain('of 3');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(3);
      await pagination.menu.closeMenu();

      await pagination.openMaxItemsMenu();
      await pagination.menu.clickMenuItem('100');
      expect(await pagination.getMaxItems()).toContain('100');
      expect(await pagination.getTotalPages()).toContain('of 2');
      await pagination.openCurrentPageMenu();
      expect(await pagination.menu.getItemsCount()).toBe(2);
      await pagination.menu.closeMenu();

      await pagination.resetToDefaultPageSize();
    });

    it('change the current page from menu - [C280107]', async () => {
      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(3);
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('51-75 of 101');
      expect(await pagination.getCurrentPage()).toContain('Page 3');
      expect(await pagination.isPreviousEnabled()).toBe(true, 'Previous button is not enabled');
      expect(await pagination.isNextEnabled()).toBe(true, 'Next button is not enabled');
      expect(await dataTable.isItemPresent('my-file-40')).toBe(true, 'File not found on page');

      await pagination.resetToDefaultPageNumber();
    });

    it('navigate to next and previous pages - [C280110]', async () => {
      await pagination.clickNext();
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('26-50 of 101');
      expect(await dataTable.isItemPresent('my-file-70')).toBe(true, 'File not found on page');
      await pagination.resetToDefaultPageNumber();

      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(2);
      await dataTable.waitForHeader();
      await pagination.clickPrevious();
      await dataTable.waitForHeader();
      expect(await pagination.getRange()).toContain('1-25 of 101');
      expect(await dataTable.isItemPresent('my-file-88')).toBe(true, 'File not found on page');

      await pagination.resetToDefaultPageNumber();
    });

    it('Previous button is disabled on first page - [C280108]', async () => {
      expect(await pagination.getCurrentPage()).toContain('Page 1');
      expect(await pagination.isPreviousEnabled()).toBe(false, 'Previous button is enabled on first page');
    });

    it('Next button is disabled on last page - [C280109]', async () => {
      await pagination.openCurrentPageMenu();
      await pagination.menu.clickNthItem(5);
      expect(await dataTable.getRowsCount()).toBe(1, 'Incorrect number of items on the last page');
      expect(await pagination.getCurrentPage()).toContain('Page 5');
      expect(await pagination.isNextEnabled()).toBe(false, 'Next button is enabled on last page');
    });
  });
}
