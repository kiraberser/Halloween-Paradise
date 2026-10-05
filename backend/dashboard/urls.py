from django.urls import path

from . import views

urlpatterns = [
    path("kpis/", views.KPIsView.as_view(), name="dashboard_kpis"),
    path("demographics/", views.DemographicsView.as_view(), name="dashboard_demographics"),
    path("timeline/", views.TimelineView.as_view(), name="dashboard_timeline"),
    path("sales-breakdown/", views.SalesBreakdownView.as_view(), name="dashboard_sales"),
    path("expenses-breakdown/", views.ExpensesBreakdownView.as_view(), name="dashboard_expenses"),
]
