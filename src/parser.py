import pathlib

from selenium import webdriver
from selenium.common.exceptions import WebDriverException, \
    NoSuchElementException


# program constants
PAGE_PATH = '../res/10000_-----Ticketmaster Delivery.htm'
PAGE_URI = pathlib.Path(PAGE_PATH).absolute().as_uri()
FIELD_NAMES = ('Section', 'Row', 'Seats', 'Subtotal', 'Time left')
PAGE_LOAD_TIMEOUT = 3 * 60  # in seconds; this equals to 3 minutes

# web page constants
CONTAINER_CLASS_NAME = 'container-neutralZone'
ELEMENTS_CLASS_NAME = 'shipValueRight'
SUBTOTAL_CSS_SELECTOR = '.shipValueRight.messageText'
CLOCK_MINUTES_ID = 'countdown_clock_minutes'
CLOCK_SECONDS_ID = 'countdown_clock_seconds'


def parse():
    # open browser and get page
    driver = webdriver.Firefox()
    driver.set_page_load_timeout(PAGE_LOAD_TIMEOUT)
    try:
        driver.get(PAGE_URI)
    except WebDriverException as e:
        print(e)
        driver.close()
        return

    # dictionary with extracted data
    data = {}
    try:
        # get section, row and seats
        container = driver.find_element_by_class_name(CONTAINER_CLASS_NAME)
        data.update(
            (name, value.text) for name, value in zip(
                FIELD_NAMES[:3],
                container.find_elements_by_class_name(ELEMENTS_CLASS_NAME),
            )
        )
        # get subtotal
        data[FIELD_NAMES[3]] = \
            driver.find_element_by_css_selector(SUBTOTAL_CSS_SELECTOR).text
        # get time left
        data[FIELD_NAMES[4]] = '{}:{}'.format(
            driver.find_element_by_id(CLOCK_MINUTES_ID).text,
            driver.find_element_by_id(CLOCK_SECONDS_ID).text,
        )
    except NoSuchElementException as e:
        print(e)
    else:
        print(data)
    finally:
        driver.close()


if __name__ == '__main__':
    parse()
