#!/usr/bin/env python
#
# Copyright 2007 Google Inc.
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
#
import datetime, os
from django.utils import simplejson
import zlib
from md5 import md5
import post
import urlparse

from google.appengine.api import users
from google.appengine.api import urlfetch
from google.appengine.api import images
from google.appengine.ext import db
from google.appengine.ext import webapp
from google.appengine.ext.webapp import util
from google.appengine.ext.webapp import template
from google.appengine.ext import blobstore
from google.appengine.ext.webapp import blobstore_handlers

class Photo(db.Model):
    original = db.BlobProperty()
    type = db.StringProperty()
    width = db.IntegerProperty()
    height = db.IntegerProperty()
    checksum = db.StringProperty()
    blob_key = db.StringProperty()
    size = db.IntegerProperty()
    date = db.DateTimeProperty(auto_now_add=True)

class GetHandler(webapp.RequestHandler):
    def get(self):
    
        url = self.request.get("url")
        urlparts = urlparse.urlsplit(url)
        name = urlparts[2].split('/')[-1] 
       
        result = urlfetch.fetch(url)
        if result.status_code == 200:
             image = images.Image(result.content)
             photo = Photo()
             #photo.original = result.content
             photo.type = result.headers['Content-type']
             photo.checksum = md5(result.content).hexdigest()
             photo.size = len(result.content)
             photo.width = image.width
             photo.height = image.height
             existingPhoto = Photo.gql("WHERE checksum = :1",photo.checksum).get()
             if existingPhoto == None:
                 photo.put()
             upload_url = blobstore.create_upload_url('/upload')
             content_type, body = post.encode_multipart_formdata([('checksum',photo.checksum)], [('file', 'test', result.content)]) 
             
             response = urlfetch.fetch(upload_url,
             							payload=body,
             							method=urlfetch.POST,
             							headers={'Content-Type':content_type})
             #self.response.headers['Content-Type'] = photo.type
             #self.response.out.write(result.content)
             self.response.out.write(response.content)
             return

class UploadHandler(blobstore_handlers.BlobstoreUploadHandler):
    def post(self):
        try:
            for upload in self.get_uploads('file'):
                blob_info = upload
                photo = Photo.gql("WHERE checksum = :1",self.request.get('checksum')).get()
                photo.blob_key = blob_info.key()
                photo.put()

            self.response.out.write('success')

        except:
            self.response.out.write('failure : '+self.request.get('checksum'))

            

class MainHandler(webapp.RequestHandler):
    def get(self):
        template_data = {}
        path = os.path.join(os.path.dirname(__file__), 'index.html')
        self.response.out.write(template.render(path, template_data))


def main():
    application = webapp.WSGIApplication([('/', MainHandler),
    										('/get', GetHandler),
    										('/upload', UploadHandler)],
                                         debug=True)
    util.run_wsgi_app(application)


if __name__ == '__main__':
    main()
