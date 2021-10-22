AUTHOR = 'jdpicks'
SITENAME = 'James D Pickering'
SITEURL = ''#'http://jamesdpickering.com'

PATH = 'content'
#PAGE_PATHS = ['pages',]
STATIC_PATHS = ['pdfs', 'programs', 'images', 'extra/CNAME']
TIMEZONE = 'Europe/London'
EXTRA_PATH_METADATA = {'extra/CNAME': {'path': 'CNAME'},}
DEFAULT_LANG = 'en'

DISPLAY_PAGES_ON_MENU = False
MENUITEMS = (
    ('Teaching', '/pages/teaching.html'), ('Research', '/pages/research.html'),
    ('Programs', '/pages/programs.html'), ('About', '/pages/about.html'),
    ('Contact', '/pages/contact.html'))

    
THEME = 'blue-penguin'
#DEFAULT_METADATA = { 'Author' : 'jdpicks' }

PAGE_ORDER_BY = 'attribute'

# Feed generation is usually not desired when developing
FEED_ALL_ATOM = None
CATEGORY_FEED_ATOM = None
TRANSLATION_FEED_ATOM = None
AUTHOR_FEED_ATOM = None
AUTHOR_FEED_RSS = None

# Blogroll
LINKS = (('Pelican', 'https://getpelican.com/'),
         ('Python.org', 'https://www.python.org/'))

# Social widget
SOCIAL = (('LinkedIn', 'www.linkedin.com/in/james-d-pickering/'),
          ('GitHub', 'www.github.com/james-d-pickering/'))

DEFAULT_PAGINATION = False

# Uncomment following line if you want document-relative URLs when developing
#RELATIVE_URLS = True
