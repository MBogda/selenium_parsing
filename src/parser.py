from selenium import webdriver
from os import path
import pathlib

page_path = pathlib.Path(
    path.abspath('../res/10000_-----Ticketmaster Delivery.htm')).as_uri()


# todo: exceptions handling
# todo: move constants

def parse():
    driver = webdriver.Firefox()
    driver.get(page_path) # todo: add timeout

    data = {}

    container = driver.find_element_by_class_name('container-neutralZone')
    elems = [
        value.text for value in container.find_elements_by_class_name(
            'shipValueRight')[:3]
    ]
    data['Section'] = elems[0]
    data['Row'] = elems[1]
    data['Seats'] = elems[2]
    data['Subtotal'] = driver.find_element_by_css_selector('.shipValueRight.messageText').text
    data['Time left'] = '{}:{}'.format(
        driver.find_element_by_id('countdown_clock_minutes').text,
        driver.find_element_by_id('countdown_clock_seconds').text,
    )
    driver.close()

    print(data)


if __name__ == '__main__':
    parse()
