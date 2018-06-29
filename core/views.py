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
