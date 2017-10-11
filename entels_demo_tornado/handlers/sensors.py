import threading
from random import randint

import time
from tornado.websocket import WebSocketHandler


class SensorsHandler(WebSocketHandler):
    def check_origin(self, origin):
        return True

    def open(self):
        self.guids = []
        self.thread_label = None
        print("WebSocket opened")

    def on_message(self, message):
        parts = message.split(' ')
        if len(parts) == 2:
            thread_label = time.time()
            self.thread_label = thread_label
            if parts[0] == 'GET_NEW':
                self.get_new(thread_label, parts[1])
            if parts[0] == 'GET_OBJ':
                self.get_new(thread_label, parts[1])

    def get_new(self, thread_label, guids=None):
        time.sleep(5)
        if guids:
            self.guids = guids.split(',')

        result = {
            'objs': []
        }
        for guid in self.guids:
            result['objs'].append({
                'id': guid,
                'attrs': [
                    {'name': 'Cod', 'value': str(randint(0, 5)), 'type': 'text'},
                    {'name': 'UpdDT', 'value': '-', 'type': 'DT'}
                ]
            })
        self.write_message(result)
        if thread_label == self.thread_label:
            threading.Timer(5, self.get_new, [thread_label]).start()

    def on_close(self):
        print("WebSocket closed")
