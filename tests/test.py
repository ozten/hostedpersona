#!/usr/bin/env python

import unittest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
import subprocess
import time

"""
Functional tests for hostedpersona.me

TODO
7) Test Persona sign in with enabled account
"""

def _browser():
    return webdriver.Firefox()

def url(path):
    prod = 'https://hostedpersona.me{0}'
    dev = 'http://localhost:3000{0}'
    host = dev
    return host.format(path)

def new_email():
    return 'hobo{0}@train.es'.format(time.time())

UNIQ_EMAIL = new_email()

class TestHostedPersona(unittest.TestCase):

    def doRegisterForm(self, browser, email, password):
        emailEl = browser.find_element(By.ID, 'email')
        self.assertIsNotNone(emailEl)
        emailEl.send_keys(email)

        passwordEl = browser.find_element(By.ID, 'password')
        self.assertIsNotNone(passwordEl)
        passwordEl.send_keys(password)

        password2El = browser.find_element(By.ID, 'password2')
        self.assertIsNotNone(password2El)
        password2El.send_keys(password)

        # TODO need an id here
        browser.find_element_by_tag_name('button').click()
        WebDriverWait(browser, 12000).until(lambda s: s.title)

    def assertLoginPage(self, browser):
        self.assertEquals(browser.current_url, url('/account'),
            'After registering an account, we can log in')
        h1_el = browser.find_element(By.TAG_NAME, 'h1')
        self.assertIsNotNone(h1_el)
        print(h1_el.text)
        self.assertEquals(h1_el.text, 'Log In',
            'Account can be info or a Log in form, we expect the form')


    def test_registration(self):
        """
        Implicitly tests
        1) Homepage renders
        2) Test registration flow
        3) Test account sign in flow disabled User (with info from step 2)
        3a) Test /authentication fails with disabled User
        4) Test logout
        5) Test bin/enable
        6) Test account sign in flow enabled User
        """
        print 'test_registartion'

        browser = _browser()
        browser.delete_all_cookies()

        browser.get(url('/'))
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        self.assertEquals(browser.title, 'Hosted Persona',
            'Homepage renders')
        browser.find_element_by_link_text('Register').click()
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        self.doRegisterForm(browser, UNIQ_EMAIL, 'password')

        self.assertLoginPage(browser)

        emailEl = browser.find_element(By.ID, 'email')
        self.assertIsNotNone(emailEl)
        emailEl.send_keys(UNIQ_EMAIL)

        passwordEl = browser.find_element(By.ID, 'password')
        self.assertIsNotNone(passwordEl)
        passwordEl.send_keys('password')

        # TODO need an id here
        browser.find_element_by_tag_name('button').click()
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        self.assertEquals(browser.current_url, url('/account'),
            'After logging in, we are on our accounts page')
        h1_el = browser.find_element(By.TAG_NAME, 'h1')
        self.assertIsNotNone(h1_el)
        self.assertEquals(h1_el.text, 'My Accounts',
            'Account can be info or a Log in form, we expect info')

        # This account is Disabled
        emailEl = browser.find_element(By.CLASS_NAME, 'current-email')
        self.assertTrue('Disabled' in emailEl.text, emailEl.text + ' should be disabled')

        # Test Logout
        browser.find_element_by_link_text('Logout').click()
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        self.assertLoginPage(browser)

        print(UNIQ_EMAIL)

        # 5) Simulate admin enabling account
        subprocess.check_call(['./hostedpersona/bin/enable.js', UNIQ_EMAIL])


        # 5, 6) Enabled account can log in
        emailEl = browser.find_element(By.ID, 'email')
        self.assertIsNotNone(emailEl)
        emailEl.send_keys(UNIQ_EMAIL)

        passwordEl = browser.find_element(By.ID, 'password')
        self.assertIsNotNone(passwordEl)
        passwordEl.send_keys('password')

        # TODO need an id here
        browser.find_element_by_tag_name('button').click()
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        self.assertEquals(browser.current_url, url('/account'),
            'After logging in, we are on our accounts page')
        h1_el = browser.find_element(By.TAG_NAME, 'h1')
        self.assertIsNotNone(h1_el)
        self.assertEquals(h1_el.text, 'My Accounts',
            'Account can be info or a Log in form, we expect info')

        # This account is Disabled
        emailEl = browser.find_element(By.CLASS_NAME, 'current-email')
        self.assertTrue('Enabled' in emailEl.text, emailEl.text + ' should be disabled')

        browser.quit()

    def test_double_registration(self):
        """ 8) Pathelogical case of registration
          Registering twice should show an error message. They
          just have to wait for the admin to enable their account.
        """
        browser = _browser()
        browser.delete_all_cookies()
        email = new_email()

        browser.get(url('/'))
        WebDriverWait(browser, 12000).until(lambda s: s.title)
        browser.find_element_by_link_text('Register').click()
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        # Register
        self.doRegisterForm(browser, email, '23lk4j32k4j23l')
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        browser.find_element_by_link_text('Logout').click()
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        browser.get(url('/'))
        WebDriverWait(browser, 12000).until(lambda s: s.title)
        browser.find_element_by_link_text('Register').click()
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        # Second Register
        self.doRegisterForm(browser, email, '23lk4j32k4j23l')
        WebDriverWait(browser, 12000).until(lambda s: s.title)

        self.assertEquals(browser.current_url, url('/register-account'),
            'We are returned to register page')
        err = browser.find_element(By.CLASS_NAME, 'error')
        self.assertIsNotNone(err)

        browser.quit()

if __name__ == '__main__':
    unittest.main()