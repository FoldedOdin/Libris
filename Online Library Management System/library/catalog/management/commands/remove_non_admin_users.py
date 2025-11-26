from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = 'Remove all users except admin users'

    def add_arguments(self, parser):
        parser.add_argument(
            '--confirm',
            action='store_true',
            help='Confirm deletion of non-admin users',
        )

    def handle(self, *args, **options):
        if not options['confirm']:
            self.stdout.write(
                self.style.WARNING(
                    'This will delete all non-admin users. '
                    'Run with --confirm to proceed.'
                )
            )
            
            # Show what would be deleted
            non_admin_users = User.objects.filter(is_staff=False, is_superuser=False)
            self.stdout.write(f'\nUsers that would be deleted: {non_admin_users.count()}')
            for user in non_admin_users:
                self.stdout.write(f'  - {user.username} ({user.email})')
            
            admin_users = User.objects.filter(is_staff=True) | User.objects.filter(is_superuser=True)
            self.stdout.write(f'\nAdmin users that will be kept: {admin_users.count()}')
            for user in admin_users:
                self.stdout.write(f'  - {user.username} ({user.email})')
            
            return

        # Delete non-admin users
        non_admin_users = User.objects.filter(is_staff=False, is_superuser=False)
        count = non_admin_users.count()
        
        if count == 0:
            self.stdout.write(self.style.SUCCESS('No non-admin users to delete.'))
            return
        
        non_admin_users.delete()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully deleted {count} non-admin user(s).'
            )
        )
        
        # Show remaining users
        remaining_users = User.objects.all()
        self.stdout.write(f'\nRemaining users: {remaining_users.count()}')
        for user in remaining_users:
            self.stdout.write(f'  - {user.username} ({user.email}) [Admin]')
