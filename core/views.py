from django.contrib import messages
from vanilla import TemplateView


class NotyView(TemplateView):
    template_name = "v2/components/noty.jinja2"

    def get_context_data(self, **kwargs):
        messages.warning(self.request, "<i>Курсив</i> [warning]")
        messages.info(self.request, "Использован вот этот плагин <a href='https://ned.im/noty/#/' target='_blank'>ссылка</a> [info]")
        messages.error(self.request, "Слава Украине! [error]")
        messages.success(self.request, "<b>Тестовое</b> сообщение длиной чуть более чем ваша жизнь. Скриньте [success]")
        messages.success(self.request, "Я тут повисю пару секунд, зырьте", extra_tags='timeout')
        return {}


class AlumniView(TemplateView):
    template_name = "v2/pages/alumni.jinja2"

    def get_context_data(self, **kwargs):
        app_data = {
            "state": {
                "area": self.kwargs.get("area", None),
                "city": self.kwargs.get("city", None),
                "year": self.kwargs.get("year", {"label": '2018', "value": 2018})
            },
            "props": {
                "entry_url": '/ajax/alumni.json',
                "cities": [
                    {"label": 'Санкт-Петербург', "value": 'spb'},
                    {"label": 'Новосибирск', "value": 'nsk'}
                ],
                "areas": [
                    {"label": 'Современная информатика', "value": 'cs'},
                    {"label": 'Разработка ПО', "value": 'se'},
                    {"label": 'Анализ данных', "value": 'ds'},
                ],
                "years": [{"label": y, "value": y} for y in reversed(range(2013, 2019))]
            }
        }
        return {
            "app_data": app_data
        }
